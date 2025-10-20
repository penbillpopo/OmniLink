import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Config } from '../config';
import { execPromise } from '../exec-promise';
export abstract class Output {
  public content: string[] = [
    '// 透過 @ay-nestjs/share 產生',
    '/* eslint-disable */',
  ];

  public constructor(public filename: string, public config: Config) {}

  public abstract generateContent(): Promise<string[]>;

  public async write() {
    this.content = this.content.concat(await this.generateContent());

    await this.ensureDir();
    let content = this.content.join('\n');
    const hex = crypto
      .createHash('sha256')
      .update(content, 'utf-8')
      .digest('hex');

    const filepath = path.relative(this.config.root, this.filename);

    const fullFilepath = path.resolve(filepath);
    const index = this.config.sharedFiles.indexOf(fullFilepath);
    if (index !== -1) {
      this.config.sharedFiles.splice(index, 1);
    }

    if (fs.existsSync(filepath)) {
      const oldContent = (
        await fs.promises.readFile(filepath, 'utf-8')
      ).trimEnd();
      const isSame = oldContent.substring(oldContent.length - 64) === hex;
      if (isSame) {
        return;
      }
    }

    content += '\n' + `// ${hex}`;
    // libs/@ay-gosu/server-shared/src/wsc.ts
    console.info(`輸出檔案 ${filepath} ${fs.existsSync(filepath)}`);
    await fs.promises.writeFile(filepath, content);
    await execPromise(`eslint --fix '${filepath}'`);
    await execPromise(`prettier --write '${filepath}'`);
  }

  public async ensureDir() {
    try {
      await fs.promises.mkdir(path.dirname(this.filename), { recursive: true });
    } catch (e) {}
  }
}
