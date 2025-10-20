import { Job } from './job';
import { Item } from './queue';

export class DelayJob<JOB extends Job = Job> extends Item {
  public constructor(public job: JOB, public fn: (job: JOB) => any) {
    super();
  }

  public isEqual(item: DelayJob<JOB>): boolean {
    return item.job === this.job && this.fn === item.fn;
  }
}
