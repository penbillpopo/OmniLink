import { safeJsonParse } from '@ay/util';
import { Channel, Options } from 'amqplib';
import Debug from 'debug';
import { firstValueFrom, Observable, Subject, Subscription } from 'rxjs';
import { ConsumeDto } from './consume.dto';
import { RabbitMqService } from './rabbit-mq.service';

const debug = Debug('rabbit-mq');
export class Exchange<T = any> {
  private _channel: Promise<Channel>;

  private _updateChannelSubscription: Subscription;

  public constructor(
    private readonly _rabbitMqService: RabbitMqService,
    private readonly _exchange: string,
    private readonly _type: string,
    private readonly _options: Options.AssertExchange,
    private readonly _channelName = 'default',
    private readonly _queueOption: Options.AssertQueue = {},
    private readonly _consumeOption: Options.Consume = {},
    private readonly _prefetch = 0,
  ) {}

  public async publish(message: T, options?: Options.Publish) {
    return await this.routing('', message, options);
  }

  public async routing(
    routingKey: string,
    message: T,
    options?: Options.Publish,
  ): Promise<boolean> {
    if (this._rabbitMqService.isClosing) throw new Error('RabbitMq closing');
    return this._rabbitMqService.lock(async () => {
      const channel = await this._getChannel();
      const data = JSON.stringify(message);
      if (!data) {
        throw new Error(`Error Exchange.routing: 資料不可為空, ${message}`);
      }
      const buffer = Buffer.from(data);
      if (channel === undefined) {
        throw new Error(
          `Error Exchange.routing: channel is undefined, ${JSON.stringify(
            message,
          )}`,
        );
      }
      return channel.publish(this._exchange, routingKey, buffer, options);
    });
  }

  public consume(pattern = ''): Observable<ConsumeDto<T>> {
    if (this._rabbitMqService.isClosing) throw new Error('RabbitMq closing');
    const subject = new Subject<ConsumeDto<T>>();

    this._rabbitMqService.lock(async () => {
      const channel$ = this._rabbitMqService.getChannel$(this._channelName);

      channel$.subscribe(async (channel) => {
        if (this._rabbitMqService.isClosing) return;
        this._rabbitMqService.lock(async () => {
          await channel.assertExchange(
            this._exchange,
            this._type,
            this._options,
          );

          const { queue } = await channel.assertQueue('', this._queueOption);

          await channel.bindQueue(queue, this._exchange, pattern);

          if (this._prefetch) {
            channel.prefetch(this._prefetch);
          }

          await channel.consume(
            queue,
            (message) => {
              if (this._rabbitMqService.isClosing) return;

              message['noAck'] = this._consumeOption.noAck;
              if (!this._consumeOption.noAck) {
                this._rabbitMqService.addPool(message);
              }
              const json = message.content.toString();
              const body = safeJsonParse(json, json);
              debug('receive message', body);
              subject.next({ channel, message, body });
            },
            this._consumeOption,
          );
        });
      });
    });

    return subject;
  }

  private async _getChannel() {
    if (!this._updateChannelSubscription) {
      const channel$ = this._rabbitMqService.getChannel$(this._channelName);
      this._updateChannelSubscription = channel$.subscribe(
        this._updateChannel.bind(this),
      );
      await firstValueFrom(channel$);
    }

    return this._channel;
  }

  private async _updateChannel(channel: Channel) {
    if (this._rabbitMqService.isClosing) return;
    this._channel = this._rabbitMqService.lock(async () => {
      await channel.assertExchange(this._exchange, this._type, this._options);
      return channel;
    });
    return this._channel;
  }

  public destroy() {
    this._updateChannelSubscription?.unsubscribe();
  }
}
