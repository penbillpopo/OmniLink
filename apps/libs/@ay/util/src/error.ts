import { safeJsonParse } from './safe-json-parse';

export class Error {
  public constructor(
    public code: string,
    public message: string = '發生錯誤',
    public detail?: any,
  ) {}

  public toString() {
    let res = `Error code: ${this.code}, message: ${this.message}`;
    if (this.detail) {
      const detail = safeJsonParse(this.detail, this.detail);
      res += `, detail: ${detail}`;
    }
    return res;
  }

  public inspect() {
    return this.toString();
  }
}
