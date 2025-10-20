import { Observable, Observer } from 'rxjs';
import { Behavior } from '../util/behavior';
import { FileReader } from '../util/file-reader';
import { Queue } from '../util/queue';
import { UploadFile } from './file';
import { UploadJob } from './job';
import { UploadResponse } from './response';

type Status = 'processing' | 'done' | 'all-done' | 'error';

export class UploadBehavior extends Behavior {
  private _chunkSize: number = 32 * 8 * 1024;

  private _queue = new Queue<UploadJob>();

  public afterConnectedServer() {
    this._queue.run(this._uploadToServer.bind(this));
  }

  public upload(method: string, ...args: any[]): Observable<UploadResponse> {
    return Observable.create((observer: Observer<UploadResponse>) => {
      const job = new UploadJob(method, args, observer);
      this._queue.add(job);

      if (this.client.isReady()) {
        this.client.checkQueryLimit(job, this._uploadToServer.bind(this));
      }
    });
  }

  private _uploadToServer(job: UploadJob) {
    const { path, jobId } = job;
    let { args } = job;
    const files: UploadFile[] = [];
    const sizes = [];
    const key = `${path}/${jobId}`;

    let fileIndex = 0;
    args = args.map((arg) => {
      if (arg.__proto__ !== File.prototype) return arg;
      const file = (files[fileIndex] = arg as UploadFile);
      file.index = fileIndex;
      file.offset = 0;
      sizes[fileIndex] = file.size;
      fileIndex++;
      return { size: file.size };
    });

    this.client.io.emit('upload_init', path, args, jobId);
    this.client.io.off(key);
    this.client.io.on(key, (status: Status, data: UploadResponse<any>) =>
      this._uploadToServerCallback(job, files, status, data),
    );
    files.map((file) => this._uploadNextBuffer(path, jobId, file));
  }

  private _uploadToServerCallback(
    job: UploadJob,
    files: UploadFile[],
    status: Status,
    data: UploadResponse,
  ) {
    const { path, jobId, observer } = job;

    const file = files[data.fileIndex];

    if (observer['closed']) {
      this.client.io.emit(`upload_cancel`, path, jobId);
      return;
    }

    switch (status) {
      case 'processing':
        observer.next({
          status: 'processing',
          fileIndex: data.fileIndex,
          file,
          percentage: data.percentage,
          finished: data.finished,
        });
        this._uploadNextBuffer(path, jobId, file);
        return;

      case 'done':
        observer.next({
          status: 'done',
          fileIndex: data.fileIndex,
          file,
          percentage: 1,
        });
        return;

      case 'all-done':
        observer.next({ status: 'all-done', result: data });
        observer.complete();
        return;

      case 'error':
        return observer.error(data);
    }
  }

  private _uploadNextBuffer(method: string, jobId: string, file: UploadFile) {
    const reader: FileReader = new FileReader();
    const end = Math.min(file.offset + this._chunkSize, file.size);
    const buffer = file.slice(file.offset, end);
    file.offset = end;
    const fileIndex = file.index;
    reader.onload = () =>
      this.client.io.emit(
        'upload_processing',
        method,
        fileIndex,
        reader.result,
        jobId,
      );
    reader.readAsArrayBuffer(buffer);
  }
}
