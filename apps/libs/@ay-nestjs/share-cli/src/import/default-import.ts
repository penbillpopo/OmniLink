import { Import } from './import';
import { NamespaceImport } from './namespace-import';

export class DefaultImport extends NamespaceImport {
  public constructor(public path: string, name: string) {
    super(path, name);
  }

  public toString(targetPath: string) {
    const modulePath = Import.relative(targetPath, this.path);
    return `import ${this.name} from '${modulePath}';`;
  }

  public mergeTo(list: Import[]) {
    const found = list.find(
      (item: DefaultImport) =>
        item instanceof DefaultImport &&
        item.path.toLowerCase() == this.path.toLowerCase() &&
        item.name == this.name,
    );

    if (!found) {
      list.push(this);
    }
  }

  public removeExcess(token: string[]) {
    return;
  }
}
