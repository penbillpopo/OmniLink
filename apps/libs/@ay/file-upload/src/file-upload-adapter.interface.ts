import { Callback } from './callback';

export interface IFileUploadAdapter {
  ls(dirname: string, callback: Callback<string[]>);

  read(fd: any, callback: Callback<Buffer>);

  rm(
    fd: any,
    callback: Callback<{
      filename: string;
      success: boolean;
      extra: any;
    }>,
  );

  receive(options?: any): NodeJS.WritableStream;
}
