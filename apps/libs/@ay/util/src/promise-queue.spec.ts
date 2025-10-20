import { delay } from 'bluebird';
import _ from 'lodash';
import { PromiseQueue } from './promise-queue';

describe('promiseQueue', () => {
  it('test', async function () {
    const logs = [];
    const queue = new PromiseQueue(3);
    for (let i = 0; i < 10; i++) {
      (async () => {
        const lock = await queue.lock();
        logs.push(i);
        await delay(10);
        if (i == 3) {
          lock.reject();
        }
        lock.resolve();
      })();
    }
    await queue.allDone();
    expect(logs.length).toBe(10);
    expect(logs).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('identifier', async function () {
    const queue = new PromiseQueue(3);
    for (let i = 0; i < 10; i++) {
      (async () => {
        const lock = await queue.lock(i);
        await delay(10);
        lock.resolve();
      })().catch((error) => console.error(error));
    }
    expect(queue.exist((i) => i === 3)).toBe(true);
    await queue.allDone();
  });

  it('increasePriority', async function () {
    const queue = new PromiseQueue(3);
    const logs = [];
    for (let i = 0; i < 10; i++) {
      (async () => {
        const lock = await queue.lock(i);
        logs.push(i);
        await delay(10);
        lock.resolve();
      })().catch((error) => console.error(error));
    }
    queue.increasePriority((i) => i === 9);
    await queue.allDone();
    expect(logs.length).toBe(10);
    expect(logs).toEqual([0, 1, 2, 9, 3, 4, 5, 6, 7, 8]);
  });

  it('remove', async function () {
    const queue = new PromiseQueue(3);
    const logs = [];
    for (let i = 0; i < 10; i++) {
      (async () => {
        const lock = await queue.lock(i);
        logs.push(i);
        await delay(10);
        lock.resolve();
      })().catch((error) => console.error(error));
    }
    queue.remove((i) => i === 9);
    await queue.allDone();
    expect(logs.length).toBe(9);
    expect(logs).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('timeout', async () => {
    const timeoutMs = 30;
    const jobTime = 50;
    const jobCount = 10;
    const concurrency = 3;
    const promiseLock = new PromiseQueue(concurrency, timeoutMs);

    const start = Date.now();

    _.range(jobCount).map(async () => {
      const lock = await promiseLock.lock();
      await delay(jobTime);
      lock.resolve();
    });

    await promiseLock.allDone();

    const end = Date.now();

    const round = Math.ceil(jobCount / concurrency);
    expect(end - start).toBeGreaterThanOrEqual(timeoutMs * round * 0.9);
    expect(end - start).toBeLessThanOrEqual(jobTime * round * 1.1);
  });
});
