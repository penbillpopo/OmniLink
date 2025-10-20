import { CodeError } from './code-error';

export enum InterrupterStatus {
  'STOP',
  'RUNNING',
}

export class JobStoppedError extends CodeError {
  public constructor() {
    super('JOB_STOPPED', 500);
  }
}

export class Interrupter {
  private _status: InterrupterStatus = InterrupterStatus.RUNNING;

  public ensureIsRunning() {
    if (this._status == InterrupterStatus.STOP) {
      throw new JobStoppedError();
    }
  }

  public stop() {
    this._status = InterrupterStatus.STOP;
  }
}
