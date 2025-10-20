import { safeJsonParse } from '@ay/util';
import { Behavior } from '../util/behavior';
import { PromiseStatus } from '../util/promise-status';
import { Queue } from '../util/queue';
import { ExecuteJob } from './job';

type Status = 'success' | 'error';

export class ExecuteBehavior extends Behavior {
  private _queue = new Queue<ExecuteJob>();

  public async execute<Result = any>(
    method: string,
    ...args: any[]
  ): Promise<Result> {
    const promiseStatus = new PromiseStatus();
    let job = new ExecuteJob(method, args, promiseStatus);

    const exist = this._queue.find(job);

    if (exist) {
      job = exist as any;
    } else {
      this._queue.add(job);
      await this.client.ready();
      this.client.checkQueryLimit(job, (job) =>
        this._executeToServer<Result>(job),
      );
    }

    return job.promiseStatus.promise;
  }

  private _executeToServer<Result>(job: ExecuteJob) {
    const { path, args } = job;

    this.client.io.emit('execute', path, args, (status: Status, data: Result) =>
      this._executeToServerCallback(job, status, data),
    );
  }

  private _executeToServerCallback<Result>(
    job: ExecuteJob,
    status: Status,
    data: Result,
  ) {
    const { path, args, promiseStatus } = job;

    try {
      this._queue.remove(job);

      switch (status) {
        case 'success':
          return promiseStatus.resolve(data);

        default:
        case 'error':
          data = safeJsonParse(data as any, {});
          if (data['code'] === 'API0001') {
            this.client.checkQueryLimit(job, this._executeToServer.bind(this));
            return;
          }
          return promiseStatus.reject(data);
      }
    } catch (error) {
      console.error('未知錯誤', {
        path,
        args,
        error,
        data,
        status,
      });
    }
  }
}
