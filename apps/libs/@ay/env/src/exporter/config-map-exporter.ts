import fs from 'fs';
import path from 'path';
import { bool } from '../basic';
import { environmentStore } from '../store';

export class ConfigMapExporter {
  public export(filepath: string, name: string, namespace: string) {
    if (bool('DISABLE_ENV_EXPORTER', false)) return;
    const configMap = `
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${name}
  namespace: ${namespace}
data:
  ${Object.keys(environmentStore.store)
    .sort()
    .map(
      (key) =>
        `${key}: ${JSON.stringify(
          environmentStore.store[key].defaultValue || '',
        )}`,
    )
    .join('\n  ')}`;

    fs.writeFileSync(path.resolve(filepath), configMap);
  }
}
