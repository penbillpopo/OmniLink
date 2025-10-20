import { CLASS } from './class';

const isNode = !!(
  typeof process !== 'undefined' &&
  process.versions &&
  process.versions.node
);

let CrossPlatformFileReader: CLASS<FileReader>;

if (isNode) {
  class FileReaderClass {
    public onload: (...args: any[]) => void;

    public result: string | ArrayBuffer;

    public readAsArrayBuffer(blob: Blob): void {
      this.result = blob as any as ArrayBuffer;
      this.onload(this.result);
    }
  }

  CrossPlatformFileReader = FileReaderClass as any;
} else {
  CrossPlatformFileReader = window['FileReader'];
}

export { CrossPlatformFileReader as FileReader };
