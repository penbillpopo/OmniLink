import { RedisConnection } from '@ay/redis';
import {
  Collection,
  Hashes,
  Lists,
  Sets,
  SortedSets,
  Strings,
} from './collection';

export type StaticSets = {
  SUNIONSTORE: (
    destination: Sets,
    arg: Sets,
    ...args: Sets[]
  ) => Promise<boolean>;
  SDIFFSTORE: (
    destination: Sets,
    arg: Sets,
    ...args: Sets[]
  ) => Promise<boolean>;
  SINTERSTORE: (
    destination: Sets,
    arg: Sets,
    ...args: Sets[]
  ) => Promise<boolean>;
};

export type CollectionClass<TVal = string, T = Collection<TVal>> = {
  new (redis: RedisConnection, key: string, type: string): T;
  StaticMethod: string[];
};

export function Generate<TVal = string>(
  redis: RedisConnection,
  _class: CollectionClass<TVal, Hashes>,
  generateKey: (...args) => string,
  type: 'string' | 'json' | 'number',
): (...args) => Hashes<TVal>;

export function Generate<TVal = string>(
  redis: RedisConnection,
  _class: CollectionClass<TVal, Lists>,
  generateKey: (...args) => string,
  type: 'string' | 'json' | 'number',
): (...args) => Lists<TVal>;

export function Generate<TVal = string>(
  redis: RedisConnection,
  _class: CollectionClass<TVal, Hashes>,
  generateKey: (...args) => string,
  type: 'string' | 'json' | 'number',
): (...args) => Hashes<TVal>;

export function Generate<TVal = string>(
  redis: RedisConnection,
  _class: CollectionClass<TVal, Strings>,
  generateKey: (...args) => string,
  type: 'string' | 'json' | 'number',
): (...args) => Strings<TVal>;

export function Generate<TVal = string>(
  redis: RedisConnection,
  _class: CollectionClass<TVal, Sets>,
  generateKey: (...args) => string,
  type: 'string' | 'json' | 'number',
): ((...args) => Sets<TVal>) & StaticSets;

export function Generate<TVal = string>(
  redis: RedisConnection,
  _class: CollectionClass<TVal, SortedSets>,
  generateKey: (...args) => string,
  type: 'string' | 'json' | 'number',
): (...args) => SortedSets<TVal>;

export function Generate<TVal = string, TClass = Collection<TVal>>(
  redis: RedisConnection,
  Class: CollectionClass<TVal, TClass>,
  generateKey: (...args) => string,
  type: 'string' | 'json' | 'number' = 'string',
): (...args) => TClass {
  const func = function (...args) {
    const key = generateKey(...args);
    return new Class(redis, key, type);
  };

  if (Class.StaticMethod) {
    for (const key of Class.StaticMethod) {
      func[key] = Class[key].bind({ generateKey });
    }
  }

  return func;
}
