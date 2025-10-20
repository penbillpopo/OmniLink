import { Observer } from 'rxjs';
import { Job } from '../util/job';
import { UploadResponse } from './response';

export class UploadJob extends Job {
  public constructor(
    public path: string,
    public args: any[],
    public observer: Observer<UploadResponse>,
  ) {
    super(path, args);
  }
}
