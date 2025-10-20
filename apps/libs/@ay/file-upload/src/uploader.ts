import fs from 'fs';
import { PassThrough, Stream } from 'stream';
import { IFileUploadAdapter } from './file-upload-adapter.interface';

export class Uploader {
  public constructor(
    public adapter: IFileUploadAdapter,
    public parseURL: (filename: string) => string,
  ) {}

  public async get(target: string) {
    return new Promise((resolve, reject) => {
      this.adapter.read(target, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }

  public async ls(target: string) {
    return new Promise((resolve, reject) => {
      this.adapter.ls(target, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }

  public async rm(target: string) {
    return new Promise((resolve, reject) => {
      this.adapter.rm(target, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }

  public async upload(local: string | Buffer, target: string) {
    const receiver = this.adapter.receive({ saveAs: target });

    return new Promise<string>((resolve, reject) => {
      const stream: any = new Stream();

      stream
        .pipe(receiver)
        .on('error', (err: any) => reject(err))
        .on('finish', () => resolve(this.parseURL(target)));

      let rs: any;
      if (local instanceof Buffer) {
        rs = new PassThrough();
        rs.end(local);
        rs.byteCount = local.length;
        rs.fd = target;
      } else {
        rs = fs.createReadStream(local);
        rs.fd = target;
        rs.byteCount = fs.statSync(local).size;
      }

      stream.emit('data', rs);
    });
  }

  public async exist(filepath: string) {
    return new Promise((resolve) => {
      this.adapter.read(filepath, (err, files) => {
        if (err) return resolve(false);
        resolve(true);
      });
    });
  }
}
