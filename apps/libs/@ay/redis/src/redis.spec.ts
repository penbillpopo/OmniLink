import { int, str } from '@ay/env';
import { RedisConnection } from './redis';

describe('RedisConnection', () => {
  const connection = new RedisConnection({
    host: str('TEST_REDIS_HOST', '127.0.0.1'),
    port: int('TEST_REDIS_PORT', 6379),
    password: str('TEST_REDIS_PASSWORD', undefined, false),
  });

  it('info', async () => {
    const redis = await connection.ready();
    const response = await redis.info();
    const info = {};

    response
      .toString()
      .split('\r\n')
      .map((row) => {
        const [key, value] = row.split(':');
        info[key] = value;
      });

    expect(info['redis_version']).toBeDefined();
  });

  it('reconnect', async () => {
    const old = await connection.ready();
    await connection.reconnect();
    const current = await connection.ready();
    if (current === old) {
      throw 'is equal';
    }
  });

  it('set / get', async () => {
    const redis = await connection.ready();
    for (let i = 0; i < 10; i++) {
      await redis.set('TEST', i);
      const ret = await redis.get('TEST');
      expect(ret).toBe(i.toString());
    }
  });

  it('end', async () => {
    await connection.close();
  });
});
