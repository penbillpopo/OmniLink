import Redis, { Redis as RedisClient, RedisOptions } from 'ioredis';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class RedisConnection {
  public readonly redis$ = new ReplaySubject<RedisClient>(1);
  public readonly ready$ = new ReplaySubject<RedisClient>(1);

  public constructor(public config: RedisOptions) {
    this._connect();
  }

  private _connect(): void {
    const redis = new Redis(this.config);

    this.redis$.next(redis);

    redis
      .on('ready', () => this.ready$.next(redis))
      .on('reconnecting', () => this.ready$.next(null))
      .on('end', () => this.ready$.next(null))
      .on('error', () => this.ready$.next(null));
  }

  public async reconnect() {
    await this.close();
    this._connect();
  }

  public ready() {
    return firstValueFrom(this.ready$.pipe(filter((ready) => ready !== null)));
  }

  public async close() {
    const redis = await firstValueFrom(this.redis$);

    if (redis) {
      await redis.quit();
    }

    this.ready$.next(null);
    this.redis$.next(null);
  }
}
