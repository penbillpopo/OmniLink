import { Collection } from './collection';

export class Strings<TVal = string> extends Collection<TVal> {
  /**
   * ### Get the value of a key
   * `O(1)`
   */
  public async GET(): Promise<TVal> {
    const redis = await this.redis.ready();
    const response = await redis.get(this.key);
    return this.parseResponse(response);
  }

  public async GETDEF(fetch: () => Promise<TVal>, second = 60, force = false) {
    let val: TVal;

    if (force) {
      val = await fetch();
      this.SETEX(val, second);
      return val;
    }

    val = await this.GET();

    if (val === null) {
      val = await fetch();
      this.SETEX(val, second);
    }

    return val;
  }

  public async GETDEL() {
    const redis = await this.redis.ready();
    const responses: any[] = await redis
      .multi()
      .get(this.key)
      .del(this.key)
      .exec();
    return this.parseResponse(responses[0][1]);
  }

  /**
   * ### Set the string value of a key
   * `O(1)`
   */
  public async SET(val: TVal): Promise<string> {
    const redis = await this.redis.ready();
    return redis.set(this.key, this.parseValue(val));
  }

  /**
   * ### Set the value and expiration of a key
   * `O(1)`
   */
  public async SETEX(val: TVal, second: number): Promise<string> {
    const redis = await this.redis.ready();
    return redis.setex(this.key, second, this.parseValue(val));
  }

  /**
   * ### Set the string value of a key and return its old value
   * `O(1)`
   */
  public async GETSET(val: TVal): Promise<TVal> {
    const redis = await this.redis.ready();
    const response = await redis.getset(this.key, this.parseValue(val));
    return this.parseResponse(response);
  }

  /**
   * ### Increment the integer value of a key by one
   * `O(1)`
   */
  public async INCR(): Promise<number> {
    const redis = await this.redis.ready();
    return redis.incr(this.key);
  }

  /**
   * ### Increment the integer value of a key by the given amount
   * `O(1)`
   */
  public async INCRBY(amount: number): Promise<number> {
    const redis = await this.redis.ready();
    return redis.incrby(this.key, amount);
  }

  /**
   * ### Decrement the integer value of a key by one
   * `O(1)`
   */
  public async DECR(): Promise<number> {
    const redis = await this.redis.ready();
    return redis.decr(this.key);
  }

  /**
   * ### Decrement the integer value of a key by the given amount
   * `O(1)`
   */
  public async DECRBY(amount: number): Promise<number> {
    const redis = await this.redis.ready();
    return redis.decrby(this.key, amount);
  }
}
