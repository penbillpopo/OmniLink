import { int, str } from '@ay/env';
import { RedisConnection } from '@ay/redis';
import { Sets } from './set';

const TIME_PRE_COMMAND = 500;
const BASE_TIME = 2000;

describe('SET', () => {
  const connection = new RedisConnection({
    host: str('TEST_REDIS_HOST', '127.0.0.1'),
    port: int('TEST_REDIS_PORT', 6379),
    password: str('TEST_REDIS_PASSWORD', undefined, false),
  });

  it('SADD_SCARD', async () => {
    const key = new Sets<number>(connection, 'SADD_SCARD', 'number');
    await key.DEL();
    await key.SADD(1, 2, 3, 4, 5, 6);
    const num = await key.SCARD();
    expect(num).toBe(6);
  });

  it('SDIFF', async () => {
    const a = new Sets<number>(connection, 'SDIFF_A', 'number');
    const b = new Sets<number>(connection, 'SDIFF_B', 'number');
    await a.SADD(1, 2, 3);
    await b.SADD(3, 4, 5);
    const res = await a.SDIFF(b);
    expect(res[0]).toBe(1);
    expect(res[1]).toBe(2);
  });

  it(
    'SDIFFSTORE',
    async () => {
      const a = new Sets<number>(connection, 'SDIFFSTORE_A', 'number');
      const b = new Sets<number>(connection, 'SDIFFSTORE_B', 'number');
      const c = new Sets<number>(connection, 'SDIFFSTORE_C', 'number');
      await a.DEL();
      await b.DEL();
      await c.DEL();
      await a.SADD(1, 2, 3);
      await b.SADD(3, 4, 5);
      await Sets.SDIFFSTORE(c, a, b);
      const res = await c.SCARD();
      expect(res).toBe(2);
    },
    7 * TIME_PRE_COMMAND + BASE_TIME,
  );

  it('SINTER', async () => {
    const a = new Sets<number>(connection, 'SINTER_A', 'number');
    const b = new Sets<number>(connection, 'SINTER_B', 'number');
    await Promise.all([a.SADD(1, 2, 3), b.SADD(3, 4, 5)]);
    const res = await a.SINTER(b);
    expect(res[0]).toBe(3);
  });

  it(
    'SINTERSTORE',
    async () => {
      const a = new Sets<number>(connection, 'SINTERSTORE_A', 'number');
      const b = new Sets<number>(connection, 'SINTERSTORE_B', 'number');
      const c = new Sets<number>(connection, 'SINTERSTORE_C', 'number');
      await Promise.all([a.SADD(1, 2, 3), b.SADD(3, 4, 5)]);
      await Sets.SINTERSTORE(c, a, b);
      const res = await c.SCARD();
      expect(res).toBe(1);
    },
    4 * TIME_PRE_COMMAND + BASE_TIME,
  );

  it(
    'SISMEMBER',
    async () => {
      const a = new Sets<number>(connection, 'SISMEMBER', 'number');
      await a.DEL();
      await a.SADD(1);
      await expect(a.SISMEMBER(1)).resolves.toEqual(true);
      await expect(a.SISMEMBER(2)).resolves.toEqual(false);
    },
    4 * TIME_PRE_COMMAND + BASE_TIME,
  );

  it(
    'SMEMBERS',
    async () => {
      const a = new Sets<number>(connection, 'SMEMBERS', 'number');
      await a.DEL();
      await a.SADD(1);
      await a.SADD(2);
      const res = await a.SMEMBERS();
      expect(res[0]).toBe(1);
      expect(res[1]).toBe(2);
    },
    4 * TIME_PRE_COMMAND + BASE_TIME,
  );

  it(
    'SMOVE',
    async () => {
      const a = new Sets<number>(connection, 'SMOVE_A', 'number');
      const b = new Sets<number>(connection, 'SMOVE_B', 'number');
      await Promise.all([a.DEL(), b.DEL()]);
      await Promise.all([a.SADD(1), a.SADD(2)]);
      await a.SMOVE(b, 1);
      const resA = await a.SMEMBERS();
      const resB = await b.SMEMBERS();
      expect(resA[0]).toBe(2);
      expect(resB[0]).toBe(1);
    },
    5 * TIME_PRE_COMMAND + BASE_TIME,
  );

  it(
    'SPOP',
    async () => {
      const a = new Sets<number>(connection, 'SPOP_A', 'number');
      await a.DEL();
      await a.SADD(1, 2, 3);

      const res = await a.SPOP();
      expect([1, 2, 3].includes(res)).toBe(true);
      const res2 = await a.SPOP(2);
      expect(res2.length).toBe(2);
    },
    6 * TIME_PRE_COMMAND + BASE_TIME,
  );

  it(
    'SRANDMEMBER',
    async () => {
      const a = new Sets<number>(connection, 'SRANDMEMBER_A', 'number');
      await a.DEL();
      await a.SADD(1, 2, 3);
      const res = await a.SRANDMEMBER();
      expect([1, 2, 3].includes(res)).toEqual(true);

      const res2 = await a.SRANDMEMBER(2);
      expect(res2.filter((res) => [1, 2, 3].includes(res)).length).toEqual(2);
    },
    6 * TIME_PRE_COMMAND + BASE_TIME,
  );

  it('SREM', async () => {
    const a = new Sets<number>(connection, 'SREM', 'number');
    await a.DEL();
    await a.SADD(1, 2, 3);
    await a.SREM(1);
    const res = await a.SMEMBERS();
    expect(res).toEqual([2, 3]);
  });

  it('SSCAN', async () => {
    const a = new Sets<string>(connection, 'SSCAN', 'string');
    await a.SADD('hello', 'hi', 'bar');
    const res1 = await a.SSCAN('h*');
    expect(res1).toEqual(expect.arrayContaining(['hello', 'hi']));
  });

  it('SUNION', async () => {
    const a = new Sets<number>(connection, 'SUNION', 'number');
    const b = new Sets<number>(connection, 'SUNION', 'number');
    await Promise.all([a.DEL(), b.DEL()]);
    await Promise.all([a.SADD(1, 2, 3), b.SADD(3, 4, 5)]);
    const res = await a.SUNION(b);
    expect(res.length).toEqual(5);
  });

  it('SUNIONSTORE', async () => {
    const a = new Sets<number>(connection, 'SUNIONSTORE_A', 'number');
    const b = new Sets<number>(connection, 'SUNIONSTORE_B', 'number');
    const c = new Sets<number>(connection, 'SUNIONSTORE_C', 'number');
    await Promise.all([a.DEL(), b.DEL(), c.DEL()]);
    await Promise.all([a.SADD(1, 2, 3), b.SADD(3, 4, 5)]);
    await Sets.SUNIONSTORE(c, a, b);
    const res = await c.SMEMBERS();
    expect(res.length).toEqual(5);
  });

  afterAll(async () => {
    await connection.close();
  });
});
