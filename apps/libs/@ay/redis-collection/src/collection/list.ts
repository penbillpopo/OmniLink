import { Collection } from './collection';

export class Lists<TVal = any> extends Collection<TVal> {
  public async LPUSH(...members: TVal[]): Promise<number> {
    const redis = await this.redis.ready();
    const parsedValues = members.map(this.parseValue);
    return redis.lpush(this.key, ...parsedValues);
  }

  public async LPUSHX(...members: TVal[]): Promise<number> {
    const redis = await this.redis.ready();
    const parsedValues = members.map(this.parseValue);
    return (redis.lpushx as any)(this.key, ...parsedValues);
  }

  public async RPUSH(...members: TVal[]): Promise<number> {
    const redis = await this.redis.ready();
    const parsedValues = members.map(this.parseValue);
    return redis.rpush(this.key, ...parsedValues);
  }

  public async RPUSHX(...members: TVal[]): Promise<number> {
    const redis = await this.redis.ready();
    const parsedValues = members.map(this.parseValue);
    return (redis.rpushx as any)(this.key, ...parsedValues);
  }

  public async LPOP(): Promise<TVal> {
    const redis = await this.redis.ready();
    const result = await redis.lpop(this.key);
    return this.parseResponse(result);
  }

  public async RPOP(): Promise<TVal> {
    const redis = await this.redis.ready();
    const result = await redis.rpop(this.key);
    return this.parseResponse(result);
  }

  public async RPOPLPUSH(dest: string): Promise<TVal> {
    const redis = await this.redis.ready();
    const result = await redis.rpoplpush(this.key, dest);
    return this.parseResponse(result);
  }

  public async LREM(action: number, target: TVal): Promise<number> {
    const redis = await this.redis.ready();
    const tar = this.parseValue(target);
    return redis.lrem(this.key, action, tar);
  }

  public async LLEN(): Promise<number> {
    const redis = await this.redis.ready();
    return redis.llen(this.key);
  }

  public async LINDEX(idx: number): Promise<number> {
    const redis = await this.redis.ready();
    const result = await redis.lindex(this.key, idx);
    return this.parseResponse(result);
  }

  public async LINSERT(
    action: 'BEFORE' | 'AFTER',
    pivot: TVal,
    value: TVal,
  ): Promise<number> {
    const redis = await this.redis.ready();
    const pivotVal = this.parseValue(pivot);
    const val = this.parseValue(value);
    if (action === 'BEFORE') {
      return redis.linsert(this.key, 'BEFORE', pivotVal, val);
    } else {
      return redis.linsert(this.key, 'AFTER', pivotVal, val);
    }
  }

  public async LSET(idx: number, value: TVal): Promise<boolean> {
    const redis = await this.redis.ready();
    const val = this.parseValue(value);
    const result = await redis.lset(this.key, idx, val);
    return result === 'OK';
  }

  public async LRANGE(start: number, stop: number): Promise<TVal[]> {
    const redis = await this.redis.ready();
    const values = await redis.lrange(this.key, start, stop);
    return values.map((val) => this.parseResponse(val));
  }

  public async LTRIM(start: number, stop: number): Promise<boolean> {
    const redis = await this.redis.ready();
    const result = await redis.ltrim(this.key, start, stop);
    return result === 'OK';
  }

  public async BLPOP(timeout: number): Promise<TVal> {
    const redis = await this.redis.ready();
    const result = await (redis.blpop as any)(this.key, timeout);
    return result[1];
  }

  public async BRPOP(timeout: number): Promise<TVal> {
    const redis = await this.redis.ready();
    const result = await (redis.brpop as any)(this.key, timeout);
    return result[1];
  }

  public async BRPOPLPUSH(dest: string, timeout: number): Promise<TVal> {
    const redis = await this.redis.ready();
    const result = await (redis.rpoplpush as any)(this.key, dest, timeout);
    return this.parseResponse(result);
  }
}
