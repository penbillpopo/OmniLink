import { Observable, Observer } from 'rxjs';
import { Behavior } from '../util/behavior';
import { SubscribeJob } from './job';

type Status = 'success' | 'error' | 'complete';

export class SubscribeBehavior extends Behavior {
  public subscribe<Result = any>(
    method: string,
    ...args: any[]
  ): Observable<Result> {
    return new Observable((observer: Observer<any>) => {
      const job = new SubscribeJob(method, args, observer);

      if (this.client.isReady() && job.subscriptionCount == 0) {
        job.subscriptionCount++;
        this.client.checkQueryLimit(job, (job: SubscribeJob<Result>) =>
          this._subscribeToServer(job),
        );
      }

      const destroyFunction = () => {
        job.subscriptionCount--;
        if (job.subscriptionCount !== 0) return;
        this._disposeToServer(job);
      };

      return destroyFunction;
    });
  }

  private _disposeToServer<Result = any>(job: SubscribeJob<Result>) {
    const { path, jobId } = job;
    const key = `${path}/${jobId}`;
    this.client.io.emit('dispose', path, jobId);
    this.client.io.off(key);
  }

  private _subscribeToServer<Result = any>(job: SubscribeJob<Result>) {
    const { path, jobId, args } = job;
    const key = `${path}/${jobId}`;
    this.client.io.emit('subscribe', path, args, jobId);
    this.client.io.off(key);
    this.client.io.on(key, (status: Status, data: Result) =>
      this._subscribeToServerCallback<Result>(job, status, data),
    );
  }

  private _subscribeToServerCallback<Result = any>(
    job: SubscribeJob<Result>,
    status: Status,
    data: Result,
  ) {
    const { observers, path, args } = job;
    observers.map((observer) => {
      try {
        switch (status) {
          case 'success':
            return observer.next(data);

          case 'complete':
            return observer.complete();

          default:
            return observer.error(data);
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
    });
  }
}
