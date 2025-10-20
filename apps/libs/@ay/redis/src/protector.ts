import { Logger } from '@nestjs/common';
import Bluebird from 'bluebird';
import { firstValueFrom } from 'rxjs';
import { RedisConnection } from './redis';

export class RedisProtector {
  private _logger = new Logger(RedisProtector.name);
  public static SignKey = '__RedisProtector__';

  public constructor(
    private readonly _redisConnection: RedisConnection,
    private readonly _interval: number,
    private readonly _memoryThreshold: number = 0,
    private readonly _sign: string = '',
  ) {}

  private _startWhenReady$ = this._redisConnection.ready$.subscribe(() =>
    this._check(),
  );

  private async _check() {
    try {
      const redis = await firstValueFrom(this._redisConnection.ready$);
      await redis.set(RedisProtector.SignKey, this._sign);

      while (1) {
        await this._checkPingPong();
        if (this._memoryThreshold) {
          await this._checkMemory();
        }
        if (this._sign) {
          await this._checkVitalSign();
        }
        await Bluebird.delay(this._interval);
      }
    } catch (error) {
      this._logger.log(error);
      this._redisConnection.reconnect();
    }
  }

  private async _checkPingPong() {
    try {
      const redis = await firstValueFrom(this._redisConnection.ready$);
      const pong = await redis.ping();
      if ('PONG' !== pong) throw false;
    } catch (error) {
      throw new Error('失去心跳特徵 (PING/PONG Error)');
    }
  }

  private async _checkMemory() {
    const redis = await firstValueFrom(this._redisConnection.ready$);
    const result = await redis.info('memory');

    const usedMemory = parseInt(
      result.toString().split('\r\n')[1].split(':')[1],
    );

    if (usedMemory >= this._memoryThreshold) {
      this._logger.error(
        `記憶體使用量超過設定值 ${usedMemory} / ${this._memoryThreshold}`,
      );
    }
  }

  private async _checkVitalSign() {
    try {
      const redis = await firstValueFrom(this._redisConnection.ready$);
      const vitalSign = await redis.get(RedisProtector.SignKey);
      if (vitalSign !== this._sign) throw false;
    } catch (error) {
      throw new Error('失去心跳特徵 (VitalKey Error)');
    }
  }
}
