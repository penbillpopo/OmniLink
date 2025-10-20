import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { PassThrough, Writable } from 'stream';

export type Option = {
  saveAs: string;
};

export type Write = (
  chunk: any,
  encoding: string,
  callback: (err?: Error) => void,
) => void;

export type WriteArguments = {
  chunk: any;
  encoding: string;
  callback: (err?: Error) => void;
};

export class RestfulFSAdapter {
  public headers: any;
  public urls: string[];

  public constructor(options: { url: string | string[]; headers: any }) {
    this.urls = options.url instanceof Array ? options.url : [options.url];
    this.headers = options.headers;
  }

  public rm(
    filepath: string,
    callbackFunction: (error?: any, result?: any) => void,
  ) {
    this._asyncRemove(filepath)
      .then((result) => callbackFunction(null, result))
      .catch((error: AxiosError) => {
        if (error.response.status === 404) callbackFunction(null, []);
        else callbackFunction(error);
      });
  }

  private async _asyncRemove(filepath: string) {
    for (const url of this.urls) {
      await axios.delete(`${url}/${filepath}`, { headers: this.headers });
    }
  }

  public async balance(executeFunction) {
    let isFirst = true;
    for (const url of this.urls) {
      try {
        const data = await executeFunction(url);
        return { isFirst, data };
      } catch (error) {}
      isFirst = false;
    }
    throw '404 NOT FOUND';
  }

  public async ls(dirPath: string, callbackFunction: (err, list?) => void) {
    this.asyncList(dirPath)
      .then((list) => callbackFunction(null, list))
      .catch((error: AxiosError) =>
        error.response.status === 404
          ? callbackFunction(null, [])
          : callbackFunction(error),
      );
  }

  public async asyncList(dirPath: string) {
    for (const url of this.urls) {
      const list = await axios.get(url + dirPath, { headers: this.headers });
      return list.data;
    }
  }

  public async read(
    filepath: string,
    callbackFunction: (error: any, data?: any) => void,
  ) {
    this.asyncRead(filepath)
      .then((list) => callbackFunction(null, list))
      .catch((error) => callbackFunction(error));
  }

  public async asyncRead(filepath: string) {
    let isFirst = false;
    let data = null;

    for (const url of this.urls) {
      try {
        data = axios
          .get(url + '/' + filepath, { headers: this.headers })
          .then((response) => response.data);
        break;
      } catch (error) {
        isFirst = false;
      }
    }

    if (!data) {
      throw '404 NOT FOUND';
    }

    if (!isFirst) {
      const rs = new PassThrough();
      rs.end(data);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      this.receive({ saveAs: filepath })._write(rs, null, () => {});
    }

    return data;
  }

  public receive(opts: Option): Writable {
    const receiver = new Writable({ objectMode: true }) as any;
    this._asyncReceive(receiver, opts);
    return receiver;
  }

  private async _asyncReceive(receiver: any, opts: Option) {
    const writePromise = new Promise<WriteArguments>((resolve) => {
      receiver._write = (chunk, encoding, callback) => {
        resolve({ chunk, encoding, callback });
      };
    });
    const { chunk, callback } = await writePromise;
    const dataPromise = new Promise<Buffer>((resolve) =>
      chunk.on('data', (data) => resolve(data)),
    );
    const data = await dataPromise;
    const formData = new FormData();
    formData.append('file', data, opts.saveAs);

    const results = [];
    for (const url of this.urls) {
      try {
        const result = await axios
          .post(url + '/' + opts.saveAs, formData.getBuffer(), {
            headers: formData.getHeaders(this.headers),
          })
          .then((response) => response.data);
        results.push(result);
      } catch (error) {
        console.error(error);
      }
    }

    receiver.emit('finish', null, results, results);
    callback();
  }
}
