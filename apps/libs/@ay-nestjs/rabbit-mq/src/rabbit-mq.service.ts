import { ExposedPromise, TimeTracker } from '@ay/util';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Channel, Message, Options, Replies } from 'amqplib';
import Debug from 'debug';
import { Observable, ReplaySubject, firstValueFrom } from 'rxjs';
import { filter, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Exchange } from './exchange';
import { Queue } from './queue';
import { RabbitMq } from './rabbit-mq';

const debug = Debug('rabbit-mq');
@Injectable()
export class RabbitMqService implements OnModuleDestroy {
  private _logger = new Logger(RabbitMqService.name);
  private _closeJob: Promise<void>;

  public get isClosing(): boolean {
    return this._closeJob !== undefined;
  }

  private readonly _pool: {
    message?: Message;
    exposedPromise: ExposedPromise;
  }[] = [];

  public readonly rabbitMq$ = new ReplaySubject<RabbitMq>(1);

  private readonly _channels$: { [name: string]: Observable<Channel> } = {};

  private _cachedAssertQueue: {
    [key: string]: Promise<Replies.AssertQueue>;
  } = {};

  private readonly _clearCachedWhenRabbitMqReset = this.rabbitMq$.subscribe(
    () => (this._cachedAssertQueue = {}),
  );

  public draining: boolean;

  public isEmptyPool() {
    return this._pool.length === 0;
  }

  public async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  public lock<T>(fn: () => Promise<T>): Promise<T> {
    const exposedPromise = new ExposedPromise<T>();
    this.addPool(undefined, exposedPromise);

    fn()
      .then((res) => exposedPromise.resolve(res))
      .catch((err) => exposedPromise.reject(err));

    return exposedPromise.promise;
  }

  public addPool(
    message: Message,
    exposedPromise = new ExposedPromise(),
  ): void {
    const item = { message, exposedPromise };
    this._pool.push(item);

    exposedPromise.promise
      .catch((error) => null)
      .then(() => {
        const index = this._pool.indexOf(item);
        if (index === -1) return;
        this._pool.splice(index, 1);
      });
  }

  public getChannel$(name = 'default'): Observable<Channel> {
    name = name || 'default';

    if (this._channels$[name] === undefined) {
      this._channels$[name] = this._createChannel$();
    }

    return this._channels$[name];
  }

  public async getChannel(name = 'default'): Promise<Channel> {
    name = name || 'default';
    return firstValueFrom(this.getChannel$(name));
  }

  public setRabbitMq(rabbitMq: RabbitMq): void {
    this.rabbitMq$.next(rabbitMq);
  }

  public async sendToQueue(
    name: string,
    content: any,
    options: {
      assert?: Options.AssertQueue;
      publish?: Options.Publish;
      channel?: string;
    } = {},
  ): Promise<void> {
    const buffer = this._toBuffer(content);
    const channel = await this.getChannel(options.channel);
    await this.assertQueue(name, options.assert);
    channel.sendToQueue(name, buffer, options.publish);
  }

  public exchange<T = any>(
    exchangeName: string,
    type: string,
    option: Options.AssertExchange = {},
    channelName = 'default',
    queueOption: Options.AssertQueue = {},
    consumeOption: Options.Consume = {},
    prefetch = 0,
  ): Exchange<T> {
    if (consumeOption.exclusive === undefined) {
      consumeOption.exclusive = true;
    }

    return new Exchange<T>(
      this,
      exchangeName,
      type,
      option,
      channelName,
      queueOption,
      consumeOption,
      prefetch,
    );
  }

  public queue<T = any>(
    queueName: string,
    options: Options.AssertQueue = {},
    channelName = 'default',
    consumeOption: Options.Consume = {},
    prefetch = 0,
  ): Queue<T> {
    return new Queue<T>(
      this,
      queueName,
      options,
      channelName,
      consumeOption,
      prefetch,
    );
  }

  protected async assertQueue(
    name: string,
    option: Options.AssertQueue = {},
  ): Promise<Replies.AssertQueue> {
    if (this._cachedAssertQueue[name]) {
      return this._cachedAssertQueue[name];
    }

    const reply = new Promise<Replies.AssertQueue>(async (resolve, reject) => {
      try {
        const channel = await this.getChannel();
        const reply = await channel.assertQueue(name, option);
        resolve(reply);
      } catch (error) {
        reject(error);
      }
    });

    this._cachedAssertQueue[name] = reply;

    return reply;
  }

  private _proxyAck(channel: Channel): void {
    const ack = channel['__proto__'].ack.bind(channel);
    const nack = channel['__proto__'].nack.bind(channel);
    const ackAll = channel['__proto__'].ackAll.bind(channel);
    const nackAll = channel['__proto__'].nackAll.bind(channel);

    const generateSingle =
      (fn: (message: Message, allUpTo?: boolean) => void) =>
      (message: Message) => {
        if (!message['noAck']) {
          fn(message);
        }

        const idx = this._pool.findIndex((item) => item?.message === message);
        if (idx !== -1) {
          const { exposedPromise } = this._pool[idx];
          exposedPromise.resolve();
        }
      };

    const generateAll = (fn: () => void) => () => {
      fn();

      this._pool.map(({ exposedPromise }) => exposedPromise.resolve());
    };

    channel.ack = generateSingle(ack).bind(this);
    channel.nack = generateSingle(nack).bind(this);
    channel.ackAll = generateAll(ackAll).bind(this);
    channel.nackAll = generateAll(nackAll).bind(this);
  }

  private _createChannel$(): Observable<Channel> {
    return this.rabbitMq$.pipe(
      switchMap((rabbitMq) => rabbitMq.createChannel()),
      filter((channel) => channel !== undefined && channel !== null),
      tap((channel) => this._proxyAck(channel)),
      shareReplay(1),
    );
  }

  private _toBuffer(data: any): Buffer {
    if (data instanceof Buffer) {
      return data;
    } else if (!(data instanceof Object)) {
      return Buffer.from(data);
    } else {
      return Buffer.from(JSON.stringify(data));
    }
  }

  private async _drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;

    const rabbitMq = await firstValueFrom(this.rabbitMq$);

    const timeTricker = new TimeTracker('停止消化');
    timeTricker.step('cannel cancel(tag)');
    const names = Object.keys(this._channels$);

    debug('await pool promises');
    timeTricker.step('await pool promises');
    await Promise.all(
      this._pool.map((message) => {
        debug('await message ack', message);
        return message.exposedPromise.promise;
      }),
    );

    debug('consumers.map(channel.cancel) & channel.close()', names);
    await Promise.all(
      names.map(async (name) => {
        const channel = await this.getChannel(name);
        await Promise.all(
          Object.keys(channel['consumers']).map((tag) => channel.cancel(tag)),
        );
        await channel.close();
      }),
    );

    this._logger.log(timeTricker);
    await rabbitMq.close();
  }

  public async close() {
    if (this._closeJob === undefined) {
      this._closeJob = this._drain();
    }

    await this._closeJob;
  }
}
