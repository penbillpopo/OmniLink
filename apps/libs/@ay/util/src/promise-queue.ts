import { delay } from 'bluebird';
import { ExposedPromise } from './exposed-promise';

export class PromiseQueue<T = any> {
  private _queue: {
    lock: ExposedPromise;
    task: ExposedPromise;
    identify: T;
    priority: 0;
  }[] = [];

  private readonly _running: ExposedPromise[] = [];

  public constructor(
    private readonly _concurrency: number,
    private readonly _timeoutMs = -1,
  ) {}

  public exist(fn: (identify: T) => boolean): boolean {
    return !!this._queue.find((queue) => fn(queue.identify));
  }

  public async lock(identify?: T) {
    const task = new ExposedPromise();

    if (this._running.length >= this._concurrency) {
      const lock = new ExposedPromise();
      this._queue.push({ lock, task, identify, priority: 0 });
      await lock.promise;
    } else {
      this._execute(task);
    }

    if (this._timeoutMs > 0) {
      delay(this._timeoutMs).then(() => {
        task.resolve('任務超時，自動執行下一個任務');
      });
    }

    return task;
  }

  public async allDone(): Promise<'OK'> {
    if (this._queue.length) {
      return this._queue[this._queue.length - 1].task.promise
        .catch(() => null)
        .then(() => this.allDone());
    }

    if (this._running.length) {
      return this._running[this._running.length - 1].promise
        .catch(() => null)
        .then(() => this.allDone());
    }

    return 'OK';
  }

  private _execute(task: ExposedPromise) {
    this._running.push(task);
    task.promise
      .catch(() => null)
      .then(() => {
        const index = this._running.indexOf(task);
        this._running.splice(index, 1);

        if (this._queue.length) {
          const next = this._queue.shift();
          next.lock.resolve();
          this._execute(next.task);
        }
      });
  }

  public increasePriority(fn: (identify: T) => boolean) {
    this._queue.filter((job) => fn(job.identify)).map((q) => q.priority++);
    this._queue.sort((a, b) => b.priority - a.priority);
  }

  public remove(fn: (identify: T) => boolean) {
    this._queue = this._queue.filter((job) => !fn(job.identify));
  }
}
