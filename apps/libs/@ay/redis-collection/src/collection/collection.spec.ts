import { int, str } from '@ay/env';
import { RedisConnection } from '@ay/redis';
import { delay } from 'bluebird';
import { Strings } from './string';

describe('Collection', () => {
  const connection = new RedisConnection({
    host: str('TEST_REDIS_HOST', '127.0.0.1'),
    port: int('TEST_REDIS_PORT', 6379),
    password: str('TEST_REDIS_PASSWORD', undefined, false),
  });

  it('EXISTS', async () => {
    const key = new Strings(connection, 'EXISTS', 'string');
    await key.DEL();
    await expect(key.EXISTS()).resolves.toBe(false);

    await key.SET('OK');
    await expect(key.EXISTS()).resolves.toBe(true);
  });

  it('DEL', async () => {
    const key = new Strings(connection, 'DEL_EXISTS', 'string');
    await key.SET('OK');
    await key.DEL();
    await expect(key.EXISTS()).resolves.toBe(false);
  });

  it('EXPIRE', async () => {
    const key = new Strings(connection, 'EXPIRE', 'string');
    await key.SET('OK');
    await key.EXPIRE(1);
    await delay(1000 * 1.1);
    await expect(key.EXISTS()).resolves.toEqual(false);
  });

  it('TTL', async () => {
    const key = new Strings(connection, 'TTL', 'string');
    await key.SET('OK');
    await key.EXPIRE(10);
    const ttl = await key.TTL();
    expect(ttl).toBeGreaterThan(9);
    expect(ttl).toBeLessThanOrEqual(10);
  });

  it('PERSIST', async () => {
    const key = new Strings(connection, 'PERSIST', 'string');
    await key.SETEX('OK', 1000);
    const ttl = await key.TTL();
    expect(ttl).toBeGreaterThan(900);
    expect(ttl).toBeLessThanOrEqual(1000);
    await key.PERSIST();
    await expect(key.TTL()).resolves.toEqual(-1);
  });

  it('toString', () => {
    const key = new Strings(connection, 'TO_STRING', 'string');
    expect(key.toString()).toEqual('TO_STRING');
  });

  afterAll(async () => {
    await connection.close();
  });
});
