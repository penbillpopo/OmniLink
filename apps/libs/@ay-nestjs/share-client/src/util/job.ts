import { isEqual } from 'lodash';
import * as uuid from 'uuid';
import { Item } from './queue';

export class Job extends Item {
  public jobId: string = uuid.v4();

  public constructor(public path: string, public args: any[]) {
    super();
  }

  public isEqual(compared: Job) {
    return this.path === compared.path && isEqual(this.args, compared.args);
  }
}
