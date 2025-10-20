import { UploadFile } from './file';

export type UploadResponse<Result = any> = {
  status: 'start' | 'processing' | 'done' | 'all-done';
  fileIndex?: number;
  file?: UploadFile;
  percentage?: number;
  finished?: number;
  result?: Result;
};
