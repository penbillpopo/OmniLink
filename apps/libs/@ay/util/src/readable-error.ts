export class ReadableError {
  public error = new Error();
  public constructor(public message: string, public arg: any = null) {}
}
