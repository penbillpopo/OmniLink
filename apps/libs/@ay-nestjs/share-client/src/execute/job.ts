import { Job } from '../util/job';
import { PromiseStatus } from '../util/promise-status';

export class ExecuteJob extends Job {
  public constructor(
    public path: string,
    public args: any[],
    public promiseStatus: PromiseStatus,
  ) {
    super(path, args);
  }
}
