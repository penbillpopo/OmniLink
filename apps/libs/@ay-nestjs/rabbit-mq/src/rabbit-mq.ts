import { bind } from '@ay/util';
import { Logger } from '@nestjs/common';
import { Channel, connect, Connection } from 'amqplib';
import Bluebird from 'bluebird';
import Debug from 'debug';
import _ from 'lodash';
import { firstValueFrom, Observable, ReplaySubject, Subject } from 'rxjs';
import { bufferTime, filter, pairwise, switchMap } from 'rxjs/operators';
import { ConnectionOption } from './connection.option';

const debug = Debug('rabbit-mq');
export class RabbitMq {
  private _closed = false;

  private readonly _logger = new Logger(RabbitMq.name);

  private readonly _connection$ = new ReplaySubject<Connection>(1);

  private readonly _closePrevConnection = this._connection$
    .pipe(
      filter((connect) => Boolean(connect)),
      pairwise(),
    )
    .subscribe(([prev]) => {
      prev.off('error', this._onError);
      prev.off('close', this._onClose);
      prev.close().catch((error) => {
        debug('close prev connection failed', error);
        if (this._isIgnoreCloseError(error)) {
          return;
        }

        throw error;
      });
    });

  private readonly _reconnectionTicker = new Subject();

  private readonly _amqpConnectionOption = [
    'protocol',
    'hostname',
    'port',
    'username',
    'password',
    'frameMax',
    'heartbeat',
    'vhost',
  ];

  private readonly _socketOptions = ['timeout'];

  public constructor(private readonly _options: ConnectionOption) {
    this._options = _options;
    this._init();
  }

  public createChannel(): Observable<Channel> {
    return this._connection$.pipe(
      filter((connection) => Boolean(connection)),
      switchMap((connection) => connection.createChannel()),
    );
  }

  private _isIgnoreCloseError(error: Error) {
    return (
      error.message.includes('Connection closing') ||
      error.message.includes('Connection closed') ||
      error.message.includes('Channel closed') ||
      error.message.includes('Channel closing')
    );
  }

  public async close(): Promise<void> {
    if (this._closed) return;
    this._closed = true;

    debug('close rabbit connection, waiting connection successed');
    const connection = await firstValueFrom(this._connection$);

    if (connection) {
      this._connection$.next(null);

      try {
        await connection.close();
        debug('close connection successed');
      } catch (error) {
        debug('close connection failed', error);
        if (this._isIgnoreCloseError(error)) {
          return;
        }

        throw error;
      }
    }
  }

  private async _init(): Promise<void> {
    if (!this._options.reconnectInterval) {
      this._options.reconnectInterval = 5;
    }

    this._autoReconnection();
    await this._connect();
  }

  private _getHostname(): string {
    if (this._options.port) {
      return `${this._options.hostname}:${this._options.port}`;
    } else {
      return `${this._options.hostname}`;
    }
  }

  private _autoReconnection(): void {
    const interval = this._options.reconnectInterval;
    this._reconnectionTicker
      .pipe(
        filter(() => !this._closed),
        bufferTime(interval * 1000),
        filter((ticker) => ticker.length > 0),
      )
      .subscribe(() => this._connect());
  }

  public async forceReconnect(): Promise<void> {
    this._reconnectionTicker.next(1);
    this._connection$.next(null);
    await Bluebird.delay(this._options.reconnectInterval * 1000);
  }

  private async _connect(): Promise<void> {
    if (this._closed) {
      return;
    }

    try {
      const amqpPptions = _.pick(this._options, ...this._amqpConnectionOption);
      const socketOptions = _.pick(this._options, ...this._socketOptions);
      debug(
        'start connect',
        { ...amqpPptions, password: '********' },
        socketOptions,
      );
      const connection = await connect(amqpPptions, socketOptions);

      connection.on('close', this._onClose);
      connection.on('error', this._onError);
      this._connection$.next(connection);
      debug('connect succeeded');
      this._logger.log(`連線成功，${this._getHostname()}`);
    } catch (error) {
      debug('connect failed', error);
      const interval = this._options.reconnectInterval;

      this._logger.error(`連線時發生錯誤，${interval}秒後重試`, error);
      this._reconnectionTicker.next(1);
    }
  }

  @bind
  private async _onClose(error: any): Promise<void> {
    if (error) {
      console.error('rabbit onClose', error);
    }

    this._connection$.next(null);
    if (!this._closed) {
      const interval = this._options.reconnectInterval;
      this._logger.error(`發生斷線，${interval}秒後重試`, error);
      this._reconnectionTicker.next(2);
    }
  }

  @bind
  private async _onError(error: any): Promise<void> {
    console.error('rabbit onError', error);
    this._connection$.next(null);
    if (!this._closed) {
      const interval = this._options.reconnectInterval;
      this._logger.error(`發生錯誤，${interval}秒後重新連線`, error);
      this._reconnectionTicker.next(3);
    }
  }
}
