import { Redis } from 'ioredis';
import { Collection } from './collection';

export class Sets<TVal = string> extends Collection<TVal> {
  /**
   * ### Add one or more membes to a set
   * `O(1)` for each element added, so `O(N)` to add N elements when the command is called with multiple arguments.
   */
  public async SADD(...members: TVal[]): Promise<number> {
    const redis = await this.redis.ready();
    const parsedValues = members.map((val) => this.parseValue(val));
    return redis.sadd(this.key, ...parsedValues);
  }

  /**
   * ### Get the number of members in a set
   * `O(1)`
   */
  public async SCARD(): Promise<number> {
    const redis = await this.redis.ready();
    return redis.scard(this.key);
  }

  /**
   * ### Subtract multiple sets
   * `O(N)`
   */
  public async SDIFF(...sets: Sets<TVal>[]): Promise<TVal[]> {
    const redis = await this.redis.ready();
    const keys = sets.map((set) => set.key);
    keys.unshift(this.key);
    const response = await redis.sdiff(...keys);
    return response.map((row) => this.parseResponse(row));
  }

  /**
   * ### Intersect multiple sets
   * `O(N*M)` worst case where N is the cardinality of the smallest set and M is the number of sets.
   */
  public async SINTER(...sets: Sets<TVal>[]): Promise<TVal[]> {
    const redis = await this.redis.ready();
    const keys = sets.map((set) => set.key);
    const response = await redis.sinter(...keys);
    return response.map((row) => this.parseResponse(row));
  }

  /**
   * ### Determine if a given value is a member of a set
   * `O(1)`
   */

  public async SISMEMBER(member: TVal): Promise<boolean> {
    const redis = await this.redis.ready();
    const res = await redis.sismember(this.key, this.parseValue(member));
    return res === 1;
  }

  /**
   * ### Get all the members in a set
   * `O(N)` where N is the set cardinality.
   */
  public async SMEMBERS(): Promise<TVal[]> {
    const redis = await this.redis.ready();
    const response = await redis.smembers(this.key);
    return response.map((row) => this.parseResponse(row));
  }

  /**
   * ### Move a member from one set to another
   * `O(1)`
   */
  public async SMOVE(destination: Sets<TVal>, member: TVal): Promise<1 | 0> {
    const redis = await this.redis.ready();
    return redis.smove(
      this.key,
      destination.key,
      this.parseValue(member),
    ) as Promise<1 | 0>;
  }

  /**
   * ### Remove and return one or multiple random members from a set
   * `O(1)`
   */
  public async SPOP(count?: 1): Promise<TVal>;
  public async SPOP(count: number): Promise<TVal[]>;
  public async SPOP(count = 1): Promise<TVal | TVal[]> {
    const redis = await this.redis.ready();
    const response = await redis.spop(this.key, count);
    if (count == 1) {
      return this.parseResponse(response[0]);
    } else {
      return response.map((res) => this.parseResponse(res));
    }
  }

  /**
   * ### Get one or multiple random members from a set
   * Without the count argument `O(1)`, otherwise `O(N)` where N is the absolute value of the passed count.
   */
  public async SRANDMEMBER(count?: 1): Promise<TVal>;
  public async SRANDMEMBER(count: number): Promise<TVal[]>;
  public async SRANDMEMBER(count = 1): Promise<TVal | TVal[]> {
    const redis = await this.redis.ready();
    const response = await redis.srandmember(this.key, count);
    if (count == 1) {
      return this.parseResponse(response[0]);
    } else {
      return response.map((res) => this.parseResponse(res));
    }
  }

  /**
   * ### Remove one or more members from a set
   * `O(N)` where N is the number of members to be removed.
   */
  public async SREM(...members: TVal[]): Promise<number> {
    const redis = await this.redis.ready();
    return await redis.srem(
      this.key,
      ...members.map((member) => this.parseValue(member)),
    );
  }

  /**
   * ### Add multiple sets
   * `O(N)` where N is the total number of elements in all given sets.
   */
  public async SUNION(...sets: Sets<TVal>[]): Promise<TVal[]> {
    const redis = await this.redis.ready();
    const keys = sets.map((set) => set.key);
    keys.unshift(this.key);
    const fn = redis.sunion.bind(redis) as any;
    const res = await fn(...keys);
    return res.map((r) => this.parseResponse(r));
  }

  /**
   * ### Add multiple sets and store the resulting set in a key
   * `O(N)` where N is the total number of elements in all given sets.
   */
  public static async SUNIONSTORE<T>(
    destination: Sets<T>,
    arg: Sets<T>,
    ...sets: Sets<T>[]
  ): Promise<number> {
    const redis = await destination.redis.ready();
    return redis.sunionstore(
      destination.key,
      arg.key,
      ...sets.map((arg) => arg.key),
    );
  }

  /**
   * ### Subtract multiple sets and store the resulting set in a key
   * `O(N)` where N is the total number of elements in all given sets.
   */
  public static async SDIFFSTORE<T>(
    destination: Sets<T>,
    set: Sets<T>,
    ...sets: Sets<T>[]
  ): Promise<number> {
    const redis = await destination.redis.ready();
    return redis.sdiffstore(
      destination.key,
      set.key,
      ...sets.map((arg) => arg.key),
    );
  }

  /**
   * ### Intersect multiple sets and store the resulting set in a key
   * `O(N*M)` worst case where N is the cardinality of the smallest set and M is the number of sets.
   */
  public static async SINTERSTORE<T>(
    destination: Sets<T>,
    set: Sets<T>,
    ...sets: Sets<T>[]
  ): Promise<number> {
    const redis = await destination.redis.ready();
    return redis.sinterstore(
      destination.key,
      set.key,
      ...sets.map((arg) => arg.key),
    );
  }

  /**
   * Time complexity: O(1) for every call. O(N) for a complete iteration, including enough command calls for the cursor to return back to 0. N is the number of elements inside the collection..
   */
  public async SSCAN(pattern: string): Promise<TVal[]> {
    const redis: Redis = await this.redis.ready();
    const fn = redis.sscan.bind(redis);
    let res: [string, string[]];
    let values: TVal[] = [];
    let cursor = 0;
    do {
      res = await fn(this.key, cursor, 'MATCH', pattern);
      values = values.concat(res[1].map((r) => this.parseResponse(r)));
      cursor = parseInt(res[0], 10);
    } while (cursor != 0);

    return values;
  }

  public static StaticMethod = ['SUNIONSTORE', 'SDIFFSTORE', 'SINTERSTORE'];
}
