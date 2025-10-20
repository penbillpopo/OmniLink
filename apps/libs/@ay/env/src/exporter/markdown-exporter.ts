import fs from 'fs';
import path from 'path';
import { bool } from '../basic';
import { environmentStore } from '../store';

export class MarkdownExporter {
  public export(filepath: string) {
    if (bool('DISABLE_ENV_EXPORTER', false)) return;

    const content = `### ◎ 環境變數說明：

| 名稱 | 預設值 |
| :-- | :---- |
${Object.keys(environmentStore.store)
  .sort()
  .map(
    (key) => `| ${key} | ${JSON.stringify(
      environmentStore.store[key].defaultValue || '',
    )} } |
`,
  )
  .join('')}`;

    fs.writeFileSync(path.resolve(filepath), content);
  }
}
