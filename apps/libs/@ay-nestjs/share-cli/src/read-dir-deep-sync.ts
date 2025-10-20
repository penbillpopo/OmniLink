import fs from 'fs';
import path from 'path';

export function readDirDeepSync(parent: string): string[] {
  const children = fs.readdirSync(parent, { withFileTypes: true });

  const files = children.map((child) => {
    const res = path.resolve(parent, child.name);
    return child.isDirectory() ? readDirDeepSync(res) : res;
  });

  return files.flat();
}
