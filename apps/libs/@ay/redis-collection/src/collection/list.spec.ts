import { int, str } from '@ay/env';
import { RedisConnection } from '@ay/redis';
import { Lists } from './list';

describe('LIST', () => {
  const connection = new RedisConnection({
    host: str('TEST_REDIS_HOST', '127.0.0.1'),
    port: int('TEST_REDIS_PORT', 6379),
    password: str('TEST_REDIS_PASSWORD', undefined, false),
  });

  it('LPUSH_LRANGE', async () => {
    const key = new Lists<number>(connection, 'LPUSH_LRANGE', 'number');
    await key.DEL();
    const LPUSH = await key.LPUSH(1, 2, 3, 4, 5, 6);
    expect(LPUSH).toBe(6);
    const values = await key.LRANGE(0, -1);
    expect(values).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it('RPUSH_LRANGE', async () => {
    const key = new Lists<number>(connection, 'RPUSH_LRANGE', 'number');
    await key.DEL();
    const RPUSH = await key.RPUSH(1, 2, 3, 4, 5, 6);
    expect(RPUSH).toBe(6);
    const values = await key.LRANGE(0, -1);
    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('LPUSHX_LRANGE_FAIL', async () => {
    const key = new Lists<number>(connection, 'LPUSHX_LRANGE_FAIL', 'number');
    await key.DEL();
    const LPUSHX = await key.LPUSHX(1, 2, 3, 4, 5, 6);
    expect(LPUSHX).toBe(0);
  });

  it('RPUSHX_LRANGE_FAIL', async () => {
    const key = new Lists<number>(connection, 'RPUSHX_LRANGE_FAIL', 'number');
    await key.DEL();
    const RPUSHX = await key.RPUSHX(1, 2, 3, 4, 5, 6);
    expect(RPUSHX).toEqual(0);
  });

  it('LPUSHX_LRANGE_SUCCESS', async () => {
    const key = new Lists<number>(
      connection,
      'LPUSHX_LRANGE_SUCCESS',
      'number',
    );
    await key.DEL();
    const LPUSH = await key.LPUSH(1);
    expect(LPUSH).toBe(1);
    const LPUSHX = await key.LPUSHX(2, 3, 4, 5, 6);
    expect(LPUSHX).toBe(6);
    const values = await key.LRANGE(0, -1);
    expect(values).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it('RPUSHX_LRANGE_SUCCESS', async () => {
    const key = new Lists<number>(
      connection,
      'RPUSHX_LRANGE_SUCCESS',
      'number',
    );
    await key.DEL();
    const RPUSH = await key.RPUSH(1);
    expect(RPUSH).toBe(1);
    const RPUSHX = await key.RPUSHX(2, 3, 4, 5, 6);
    expect(RPUSHX).toBe(6);
    const values = await key.LRANGE(0, -1);
    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('LPOP_LRANGE', async () => {
    const key = new Lists<number>(connection, 'LPOP_LRANGE', 'number');
    await key.DEL();
    const RPUSH = await key.RPUSH(1, 2, 3, 4, 5, 6);
    expect(RPUSH).toBe(6);
    const values = await key.LRANGE(0, -1);
    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
    const val = await key.LPOP();
    expect(val).toBe(1);
    const values2 = await key.LRANGE(0, -1);
    expect(values2).toEqual([2, 3, 4, 5, 6]);
  });

  it('RPOP_LRANGE', async () => {
    const key = new Lists<number>(connection, 'RPOP_LRANGE', 'number');
    await key.DEL();
    const RPUSH = await key.RPUSH(1, 2, 3, 4, 5, 6);
    expect(RPUSH).toBe(6);
    const values = await key.LRANGE(0, -1);
    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
    const val = await key.RPOP();
    expect(val).toBe(6);
    const values2 = await key.LRANGE(0, -1);
    expect(values2).toEqual([1, 2, 3, 4, 5]);
  });

  it('RPOPLPUSH_LRANGE', async () => {
    const key = new Lists<number>(connection, 'RPOPLPUSH_LRANGE', 'number');
    const key2 = new Lists<number>(connection, 'RPOPLPUSH_LRANGE_2', 'number');
    await key.DEL();
    await expect(key.RPUSH(1, 2, 3, 4, 5, 6)).resolves.toBe(6);
    await expect(key.LRANGE(0, -1)).resolves.toEqual([1, 2, 3, 4, 5, 6]);
    await key2.DEL();
    await expect(key2.LRANGE(0, -1)).resolves.toEqual([]);
    await expect(key.RPOPLPUSH('RPOPLPUSH_LRANGE_2')).resolves.toBe(6);
    await expect(key.LRANGE(0, -1)).resolves.toEqual([1, 2, 3, 4, 5]);
    await expect(key2.LRANGE(0, -1)).resolves.toEqual([6]);
  });

  it('LREM_LRANGE', async () => {
    const key = new Lists<number>(connection, 'LREM_LRANGE', 'number');
    await key.DEL();
    await expect(key.RPUSH(1, 2, 1, 2, 1, 2)).resolves.toBe(6);
    await expect(key.LRANGE(0, -1)).resolves.toEqual([1, 2, 1, 2, 1, 2]);
    await expect(key.LREM(2, 1)).resolves.toBe(2);
    await expect(key.LRANGE(0, -1)).resolves.toEqual([2, 2, 1, 2]);
  });

  it('LLEN_RPUSH', async () => {
    const key = new Lists<number>(connection, 'LLEN_RPUSH', 'number');
    await key.DEL();
    await expect(key.RPUSH(1, 2, 1, 2, 1, 2)).resolves.toBe(6);
    await expect(key.LLEN()).resolves.toBe(6);
  });

  it('LINDEX_RPUSH', async () => {
    const key = new Lists<number>(connection, 'LINDEX_RPUSH', 'number');
    await key.DEL();
    await expect(key.RPUSH(1, 2, 3, 4, 5, 6)).resolves.toBe(6);
    await expect(key.LINDEX(2)).resolves.toBe(3);
  });

  it('LINSERT_LRANGE', async () => {
    const key = new Lists<number>(connection, 'LINSERT_LRANGE', 'number');
    await key.DEL();
    await expect(key.RPUSH(1, 2, 3, 4, 5, 6)).resolves.toBe(6);
    await expect(key.LINSERT('AFTER', 3, 3.5)).resolves.toBe(7);
    await expect(key.LRANGE(0, -1)).resolves.toEqual([1, 2, 3, 3.5, 4, 5, 6]);
  });

  it('LSET_LRANGE', async () => {
    const key = new Lists<number>(connection, 'LSET_LRANGE', 'number');
    await key.DEL();
    await expect(key.RPUSH(1, 2, 3, 4, 5, 6)).resolves.toBe(6);
    await expect(key.LSET(3, 9)).resolves.toBe(true);
    await expect(key.LRANGE(0, -1)).resolves.toEqual([1, 2, 3, 9, 5, 6]);
  });

  it('EMPTY', async () => {
    const key = new Lists<number>(connection, 'EMPTY', 'number');
    await key.DEL();
    await expect(key.LRANGE(0, -1)).resolves.toEqual([]);
    await expect(key.LPOP()).resolves.toBe(0);
    await expect(key.RPOP()).resolves.toBe(0);
    await expect(key.LINDEX(0)).resolves.toBe(0);
  });

  it('LTRIM', async () => {
    const key = new Lists<number>(connection, 'LTRIM', 'number');
    await key.DEL();
    await expect(key.RPUSH(1, 2, 3, 4, 5, 6)).resolves.toBe(6);
    await expect(key.LRANGE(0, -1)).resolves.toEqual([1, 2, 3, 4, 5, 6]);
    await expect(key.LTRIM(2, 4)).resolves.toBe(true);
    await expect(key.LRANGE(0, -1)).resolves.toEqual([3, 4, 5]);
  });

  afterAll(async () => {
    await connection.close();
  });
});
