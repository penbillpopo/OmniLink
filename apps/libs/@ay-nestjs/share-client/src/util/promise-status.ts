export class PromiseStatus<Result = any> {
  public promise: Promise<Result>;
  public resolve: (value?: Result | PromiseLike<Result>) => void;
  public reject: (reason?: any) => void;

  public constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
