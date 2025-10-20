import { Collection } from './collection';

export class Hashes<TVal = string> extends Collection<TVal> {
  public async HDEL(...fields: (string | number)[]): Promise<number> {
    const redis = await this.redis.ready();
    return redis.hdel(this.key, ...fields.map((field) => field.toString()));
  }

  public async HEXISTS(field: string): Promise<boolean> {
    const redis = await this.redis.ready();
    const result = await redis.hexists(this.key, field);
    return result === 1;
  }

  public async HGET(field: string | number): Promise<TVal> {
    const redis = await this.redis.ready();
    const res = await redis.hget(this.key, field.toString());
    return this.parseResponse(res);
  }

  public async HGETALL(): Promise<{ [key: string]: TVal }> {
    const redis = await this.redis.ready();
    const res = await redis.hgetall(this.key);
    const ret = {};
    if (res === undefined || res === null) return ret;
    Object.keys(res).map((key) => (ret[key] = this.parseResponse(res[key])));
    return ret;
  }

  public async HINCRBY(field: string | number, amount = 1): Promise<number> {
    const redis = await this.redis.ready();
    return redis.hincrby(this.key, field.toString(), amount);
  }

  public async HINCRBYFLOAT(
    field: string | number,
    amount: number,
  ): Promise<string> {
    const redis = await this.redis.ready();
    return redis.hincrbyfloat(this.key, field.toString(), amount);
  }

  public async HKEYS(): Promise<string[]> {
    const redis = await this.redis.ready();
    return redis.hkeys(this.key);
  }

  public async HLEN(): Promise<number> {
    const redis = await this.redis.ready();
    return redis.hlen(this.key);
  }

  public async HMGET(field: string): Promise<string[]>;
  public async HMGET(
    field: string | number,
    ...fields: string[]
  ): Promise<string>;
  public async HMGET(field: string | number, ...fields: string[]) {
    const redis = await this.redis.ready();
    fields.unshift(field.toString());
    const res = await redis.hmget(this.key, ...fields);
    if (fields.length == 1) {
      return this.parseResponse(res[0]);
    } else {
      return res.map((res) => this.parseResponse(res));
    }
  }

  public async HMSET(...args: (string | number)[]): Promise<'OK'> {
    const redis = await this.redis.ready();
    return redis.hmset(this.key, ...args);
  }

  public async HSET(
    field: string | number,
    value: string | number,
  ): Promise<number> {
    const redis = await this.redis.ready();
    return redis.hset(this.key, field.toString(), value.toString());
  }

  public async HSETNX(
    field: string | number,
    value: string | number,
  ): Promise<number> {
    const redis = await this.redis.ready();
    return redis.hsetnx(this.key, field.toString(), value.toString());
  }

  public async HSTRLEN(field: string | number): Promise<number> {
    const redis = await this.redis.ready();
    return redis['hstrlen'](this.key, field.toString());
  }

  public async HVALS(): Promise<TVal[]> {
    const redis = await this.redis.ready();
    const res = await redis.hvals(this.key);
    return res.map((res) => this.parseResponse(res));
  }
}
