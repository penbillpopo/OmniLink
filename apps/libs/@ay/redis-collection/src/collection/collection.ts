import { RedisConnection } from '@ay/redis';

export class Collection<TVal = string> {
  public static StaticMethod = [];

  public constructor(
    public redis: RedisConnection,
    public key: string,
    protected type: 'string' | 'json' | 'number' = 'string',
  ) {}

  protected parseResponse(val: string) {
    if (this.type == 'json') {
      if (val === null) {
        return null;
      } else {
        return JSON.parse(val);
      }
    } else if (this.type == 'number') {
      if (val === null) {
        return 0;
      } else {
        return parseFloat(val) as any;
      }
    } else {
      return val as any;
    }
  }

  protected parseValue(val: TVal): string {
    if (typeof val === 'number') return val.toString();
    else if (typeof val === 'string') return val;
    else if (typeof val === 'object') return JSON.stringify(val) as any;
  }

  public async DEL(): Promise<number> {
    const redis = await this.redis.ready();
    return redis.del(this.key);
  }

  public async EXPIRE(second: number): Promise<number> {
    const redis = await this.redis.ready();
    return redis.expire(this.key, second);
  }

  public async EXISTS(): Promise<boolean> {
    const redis = await this.redis.ready();
    const result = await redis.exists(this.key);
    return result === 1;
  }

  public async TTL(): Promise<number> {
    const redis = await this.redis.ready();
    return redis.ttl(this.key);
  }

  public async PERSIST(): Promise<number> {
    const redis = await this.redis.ready();
    return redis.persist(this.key);
  }

  public toString() {
    return this.key;
  }
}
