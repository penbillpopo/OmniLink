export class ExposedPromise<T = any> {
  public promise: Promise<T>;

  private _resolve: (value?: T | PromiseLike<T>) => void;
  private _reject: (reason?: any) => void;
  private _status: 'pending' | 'resolved' | 'rejected' = 'pending';

  public constructor() {
    this.renew();
  }

  public get status() {
    return this._status;
  }

  public isPending() {
    return this._status === 'pending';
  }

  public resolve(value?: T | PromiseLike<T>) {
    if (this._status !== 'pending') {
      return;
    }
    this._status = 'resolved';
    return this._resolve(value);
  }

  public reject(reason?: any) {
    if (this._status !== 'pending') {
      return;
    }
    this._status = 'rejected';
    return this._reject(reason);
  }

  public renew() {
    this._status = 'pending';
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
}
