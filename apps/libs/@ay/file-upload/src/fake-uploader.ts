import { Uploader } from './uploader';

export class FakeUploader extends Uploader {
  private readonly _memory: { [url: string]: any } = {};

  public async get(target: string) {
    return Promise.resolve(this._memory[target]);
  }

  public async ls(target: string) {
    return Promise.resolve([]);
  }

  public async rm(target: string) {
    delete this._memory[target];
    return Promise.resolve(true);
  }

  public async upload(local: string | Buffer, target: string) {
    this._memory[target] = local;
    return Promise.resolve('');
  }

  public async exist(target) {
    return Promise.resolve(!!this._memory[target]);
  }
}
