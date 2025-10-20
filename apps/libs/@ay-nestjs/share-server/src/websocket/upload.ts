import { Behavior } from './behavior';
import { WebSocketRoute } from './route';

export class UploadBehavior extends Behavior {
  public jobs: {
    [key: string]: {
      files: {
        argIndex: number;
        size: number;
        buffer: Buffer;
      }[];
      fileCount: number;
      args: any[];
    };
  } = {};

  public init(route: WebSocketRoute, args: any[], jobId: string) {
    const key = `${route.path}/${jobId}`;
    try {
      this.connection.checkQueryLimit();
      const files = route.rules
        .map((rule, index) => {
          if (rule.type === 'File') {
            return {
              argIndex: index,
              size: args[index].size as number,
              buffer: Buffer.from(''),
            };
          } else {
            return null;
          }
        })
        .filter(Boolean);

      this.jobs[key] = { files, fileCount: files.length, args };
    } catch (error) {
      error = this.connection.parseError(error, route, args);
      this.emit(key, 'error', error);
    }
  }

  public async processing(
    route: WebSocketRoute,
    fileIndex: number,
    buffer: Buffer,
    jobId: string,
  ) {
    const key = `${route.path}/${jobId}`;

    try {
      const job = this.jobs[key];
      const file = job.files[fileIndex];
      const oriBuffer = file.buffer;
      file.buffer = Buffer.concat([oriBuffer, buffer]);
      const percentage = (file.buffer.length / file.size) * 100;
      let status = 'processing';

      if (file.buffer.length == file.size) {
        status = 'done';
        job.args[file.argIndex] = file.buffer;
        job.fileCount--;
      }

      this.emit(key, status, {
        fileIndex,
        finished: file.buffer.length,
        percentage,
      });

      if (status == 'done' && job.fileCount == 0) {
        const controller = this.server.app.get(route.controller);
        const method = controller[route.method];
        const response = await method.apply(controller, job.args);

        this.deleteUploadBuffer(key);
        this.emit(key, 'all-done', response);
      }
    } catch (error) {
      error = this.connection.parseError(error, route, []);
      this.emit(key, 'error', error);
    }
  }

  public cancel(route: WebSocketRoute, jobId: string) {
    const key = `${route.method}_${jobId}`;
    try {
      this.deleteUploadBuffer(key);
    } catch (error) {
      this.emit(key, 'error', '使用者取消上傳');
    }
  }

  public deleteUploadBuffer(key: string) {
    try {
      delete this.jobs[key];
    } catch (error) {
      this.emit(key, 'error', error);
    }
  }
}
