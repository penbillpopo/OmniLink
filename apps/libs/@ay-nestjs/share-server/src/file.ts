import * as fs from 'fs';
import * as path from 'path';

export class File {
  public name: string;
  private _data: Buffer;
  private _size: number;

  public get size() {
    return this._size;
  }

  public constructor(filepath: string, name?: string) {
    this._data = fs.readFileSync(filepath);
    this.name = name ? name : path.basename(filepath);
    this._size = this._data.length;
  }

  public slice(start?: number, end?: number, contentType?: string) {
    return this._data.slice(start, end);
  }
}
