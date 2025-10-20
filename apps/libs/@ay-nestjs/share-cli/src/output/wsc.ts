import { Config } from '../config';
import { Output } from './output.class';

export class WSC extends Output {
  public constructor(public config: Config) {
    super(`${config.dist}/src/wsc.ts`, config);
  }

  public async generateContent(): Promise<string[]> {
    return [
      `import { WSClient } from "@ay-nestjs/share-client";`,
      `export let wsc = new WSClient();`,
    ];
  }
}
