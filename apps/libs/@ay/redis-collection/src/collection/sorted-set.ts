import { Collection } from './collection';

export class SortedSets<TVal = string> extends Collection<TVal> {
  public async ZCARD(): Promise<number> {
    const redis = await this.redis.ready();
    return redis.zcard(this.key);
  }

  public async ZADD(...scoreAndMember: any[]): Promise<number> {
    const redis = await this.redis.ready();
    return (redis.zadd as any)(this.key, ...scoreAndMember);
  }

  public async ZRANGE(
    start: number,
    stop: number,
    withScores = false,
  ): Promise<string[]> {
    const redis = await this.redis.ready();
    if (withScores) {
      return redis.zrange(this.key, start, stop, 'WITHSCORES');
    } else {
      return redis.zrange(this.key, start, stop);
    }
  }
}
