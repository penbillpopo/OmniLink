import { delay } from 'bluebird';
import _ from 'lodash';
import { PromiseLock } from './promise-lock';

describe('promiseLock', () => {
  const promiseLock = new PromiseLock();
  const log = [];

  async function test(t: string) {
    const lock = await promiseLock.lock();
    for (let i = 0; i < 3; i++) {
      await delay(1);
      log.push(`${t}:${i}`);
    }
    lock.resolve('OK');
  }

  it('log', async () => {
    await Promise.all([test('A'), test('B'), test('C')]);
    expect(log).toEqual([
      'A:0',
      'A:1',
      'A:2',
      'B:0',
      'B:1',
      'B:2',
      'C:0',
      'C:1',
      'C:2',
    ]);
  });

  it('timeout', async () => {
    const timeoutMs = 30;
    const jobTime = 100;
    const jobCount = 5;
    const promiseLock = new PromiseLock(timeoutMs);

    const start = Date.now();

    _.range(jobCount).map(async () => {
      const lock = await promiseLock.lock();
      await delay(jobTime);
      lock.resolve();
    });

    const lock = await promiseLock.lock();
    lock.resolve();

    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(timeoutMs * jobCount);
    expect(end - start).toBeLessThanOrEqual(jobTime * jobCount);
  });
});
