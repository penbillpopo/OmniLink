import Bluebird from 'bluebird';
import { BehaviorSubject } from 'rxjs';
import { RedisProtector } from './protector';

const INTERVAL = 10;
const THRESHOLD = 10;

describe('RedisProtector', () => {
  const fakeRedis = {
    storage: {},
    success_ping: async () => 'PONG',
    fail_ping: async () => {
      throw 'ERROR';
    },
    set: async (key: string | number, value: any) => {
      fakeRedis.storage[key] = value;
      return value;
    },
    success_get: async (key: string | number) => fakeRedis.storage[key],
    fail_get: async () => {
      throw 'ERROR';
    },
    success_info: async () => '# Memory\r\nmemory:1',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fail_info: async (type: any, callback: any) =>
      '# Memory\r\nmemory:' + THRESHOLD,
    reconnectCount: 0,
  } as any;

  fakeRedis.ping = fakeRedis.success_ping;
  fakeRedis.get = fakeRedis.success_get;
  fakeRedis.info = fakeRedis.success_info;

  const fakeConnection = {
    ready$: new BehaviorSubject(fakeRedis),
    reconnect: async () => {
      fakeRedis.reconnectCount++;
      await Bluebird.delay(INTERVAL);
      fakeConnection.ready$.next(fakeRedis);
    },
  };

  const protector = new RedisProtector(
    fakeConnection as any,
    INTERVAL,
    THRESHOLD,
    'SIGN',
  );

  it('instance', () => {
    expect(protector).toBeDefined();
  });

  it('sign', async () => {
    await Bluebird.delay(INTERVAL);
    expect(fakeRedis.storage['__RedisProtector__']).toBe('SIGN');
  });

  it('ping pong', async () => {
    fakeRedis.ping = fakeRedis.fail_ping;
    fakeRedis.reconnectCount = 0;
    await Bluebird.delay(INTERVAL * 2);
    expect(fakeRedis.reconnectCount).toBeGreaterThan(0);
    fakeRedis.ping = fakeRedis.success_ping;
  });

  it('memory', async () => {
    fakeRedis.ping = fakeRedis.success_ping;
    fakeRedis.info = fakeRedis.fail_info;
    fakeRedis.reconnectCount = 0;
    await Bluebird.delay(INTERVAL * 2);
    expect(fakeRedis.reconnectCount).toBe(0);
    fakeRedis.info = fakeRedis.success_info;
  });

  it('sign', async () => {
    fakeRedis.get = fakeRedis.fail_get;
    fakeRedis.reconnectCount = 0;
    await Bluebird.delay(INTERVAL * 2);
    expect(fakeRedis.reconnectCount).toBeGreaterThan(0);
    fakeRedis.get = fakeRedis.success_get;
  });

  it('end', async () => {
    fakeRedis.ping = fakeRedis.fail_ping;
    fakeRedis.get = fakeRedis.fail_get;
    fakeRedis.info = fakeRedis.fail_info;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    fakeConnection.reconnect = async () => {};
  });
});
