import { ExposedPromise, safeJsonParse } from '@ay/util';
import { Channel, Options } from 'amqplib';
import { firstValueFrom, Observable, Subject, Subscription } from 'rxjs';
import { ConsumeDto } from './consume.dto';
import { RabbitMqService } from './rabbit-mq.service';

export class Queue<T = any> {
  private _channel: Promise<Channel>;

  private _updateChannelSubscription: Subscription;

  private _subscription: Subscription;

  private _consumerTag: ExposedPromise = null;

  private _subject: Subject<ConsumeDto<T>>;

  public constructor(
    private readonly _rabbitMqService: RabbitMqService,
    private readonly _queue: string,
    private readonly _options: Options.AssertQueue = {},
    private readonly _channelName: string = 'default',
    private readonly _consumeOption: Options.Consume,
    private readonly _prefetch: number,
  ) {}

  public async send(message: T, option?: Options.Publish): Promise<boolean> {
    if (this._rabbitMqService.isClosing) throw new Error('RabbitMq closing');
    return this._rabbitMqService.lock(async () => {
      const channel = await this._getChannel();
      const data = JSON.stringify(message);
      if (!data) {
        throw new Error(`Error Queue.send: 資料不可為空, ${message}`);
      }

      const buffer = Buffer.from(data);
      return channel.sendToQueue(this._queue, buffer, option);
    });
  }

  public async cancel() {
    const channel = await this._getChannel();

    if (this._consumerTag) {
      try {
        const consumerTag = await this._consumerTag.promise;
        await channel.cancel(consumerTag);
        this._subject = null;
        this._consumerTag = null;
      } catch (error) {
        console.error('cancel consumerTag error', error);
        this._subject = null;
        this._consumerTag = null;
      }
    }

    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }

    if (this._updateChannelSubscription) {
      this._updateChannelSubscription.unsubscribe();
      this._updateChannelSubscription = null;
    }
  }

  public consume(): Observable<ConsumeDto<T>> {
    if (this._subject) return this._subject;
    if (this._rabbitMqService.isClosing) throw new Error('RabbitMq closing');

    this._subject = new Subject();
    const subject = this._subject;
    this._consumerTag = new ExposedPromise();

    this._rabbitMqService.lock(async () => {
      this._subscription = this._rabbitMqService
        .getChannel$(this._channelName)
        .subscribe(async (channel) => {
          try {
            await channel.assertQueue(this._queue, this._options);
            if (this._prefetch) {
              channel.prefetch(this._prefetch);
            }

            const consumer = await channel.consume(
              this._queue,
              async (message) => {
                const noAck = this._consumeOption.noAck;
                message['noAck'] = noAck;
                if (!noAck) {
                  this._rabbitMqService.addPool(message);
                }

                const json = message.content.toString();
                const body = safeJsonParse(json, json);

                if (subject !== this._subject) {
                  await channel
                    .cancel(consumer.consumerTag)
                    .catch((error) =>
                      console.error('解除訂閱時發生錯誤', error),
                    );
                  return;
                }

                this._subject.next({
                  channel,
                  message,
                  body,
                });
              },
              this._consumeOption,
            );

            this._consumerTag.resolve(consumer.consumerTag);
          } catch (error) {
            this._subject.error(error);
          }
        });
    });

    return this._subject;
  }

  private async _getChannel() {
    if (!this._updateChannelSubscription) {
      const channel$ = this._rabbitMqService.getChannel$(this._channelName);
      this._channel = firstValueFrom(channel$);
      this._updateChannelSubscription = channel$.subscribe((channel) =>
        this._updateChannel(channel),
      );
    }

    return this._channel;
  }

  private async _updateChannel(channel: Channel) {
    if (this._rabbitMqService.isClosing) return;
    this._channel = this._rabbitMqService.lock(async () => {
      await channel.assertQueue(this._queue, this._options);
      return channel;
    });
    return this._channel;
  }
}
