import { delay } from 'bluebird';
import { ExposedPromise } from './exposed-promise';

export class PromiseLock {
  private _queue: ExposedPromise[] = [];

  public constructor(private readonly _timeoutMs = -1) {}

  public async lock() {
    const task = new ExposedPromise();

    if (this._queue.length) {
      const last = this._queue[this._queue.length - 1];
      this._queue.push(task);
      await last.promise;
    } else {
      this._queue.push(task);
    }

    if (this._timeoutMs > 0) {
      delay(this._timeoutMs).then(() => {
        task.resolve('任務超時，自動執行下一個任務');
      });
    }

    return task;
  }
}
