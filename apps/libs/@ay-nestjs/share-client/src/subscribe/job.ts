import { Observer } from 'rxjs';
import { Job } from '../util/job';

export class SubscribeJob<Result = any> extends Job {
  public subscriptionCount = 0;
  public observers: Observer<Result>[] = [];

  public constructor(
    public path: string,
    public args: any[],
    public observer: Observer<Result>,
  ) {
    super(path, args);
    this.observers.push(observer);
  }
}
