import { int, str } from '@ay/env';
import { RedisConnection } from '@ay/redis';
import { delay } from 'bluebird';
import { Strings } from './string';

describe('Strings', () => {
  const connection = new RedisConnection({
    host: str('TEST_REDIS_HOST', '127.0.0.1'),
    port: int('TEST_REDIS_PORT', 6379),
    password: str('TEST_REDIS_PASSWORD', undefined, false),
  });

  it('GETDEL', async () => {
    const key = new Strings(connection, 'GETDEL', 'string');
    await key.SET('OK');
    const response = await Promise.all([key.GETDEL(), key.GETDEL()]);
    expect(response).toContain('OK');
    expect(response).toContain(null);
  });

  it('GETDEF', async () => {
    const key = new Strings(connection, 'GETDEF', 'string');
    await key.DEL();
    const val = await key.GETDEF(async () => {
      await delay(100);
      return '1';
    }, 10);
    expect(val).toEqual('1');
  });

  it('SET / GET', async () => {
    const key = new Strings(connection, 'SET_GET', 'string');
    await key.SET('OK');
    await expect(key.GET()).resolves.toBe('OK');
  });

  it('SET / GET number', async () => {
    const key = new Strings<number>(connection, 'SET_GET_NUMBER', 'number');
    await key.SET(3);
    await expect(key.GET()).resolves.toBe(3);
  });

  it('SET / GET object', async () => {
    const key = new Strings<any>(connection, 'GET_SET_OBJECT', 'json');
    await key.SET({ name: 'test' });
    await expect(key.GET()).resolves.toMatchObject({ name: 'test' });
  });

  it('SET / GET object null', async () => {
    const key = new Strings<any>(connection, 'GET_SET_OBJECT_NULL', 'json');
    await key.DEL();
    await expect(key.GET()).resolves.toBeNull();
  });

  it('INCR / DECR', async () => {
    const key = new Strings<number>(connection, 'INCR_DECR', 'number');
    await key.SET(3);
    await key.INCR();
    await expect(key.GET()).resolves.toBe(4);
    await key.DECR();
    await expect(key.GET()).resolves.toBe(3);
  });

  it('INCRBY / DECRBY', async () => {
    const key = new Strings<number>(connection, 'INCRBY_DECRBY', 'number');
    await key.SET(3);
    await key.INCRBY(3);
    await expect(key.GET()).resolves.toBe(6);
    await key.DECRBY(3);
    await expect(key.GET()).resolves.toBe(3);
  });

  it('GETSET', async () => {
    const key = new Strings<number>(connection, 'GETSET', 'number');
    await key.SET(3);
    await expect(key.GETSET(4)).resolves.toBe(3);
    await expect(key.GET()).resolves.toBe(4);
  });

  it('multi get / set', async () => {
    const key = new Strings<number>(connection, 'MULTI_GET_SET', 'number');
    for (let i = 0; i < 5; i++) {
      await key.SET(i);
      const ret = await key.GET();
      expect(ret).toBe(i);
    }
  });

  it('SETEX', async () => {
    const key = new Strings<number>(connection, 'SETEX', 'number');
    await key.SETEX(3, 1);
    await delay(1000 * 1.1);
    await expect(key.GET()).resolves.toBe(0);
  });

  afterAll(async () => {
    await connection.close();
  });
});
