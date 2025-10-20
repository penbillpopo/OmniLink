import { Import } from './import';

export class NamespaceImport extends Import {
  public constructor(public path: string, public name: string) {
    super(path);
  }

  public toString(targetPath: string) {
    const modulePath = Import.relative(targetPath, this.path);
    return `import ${this.name} from '${modulePath}';`;
  }

  public mergeTo(list: Import[]) {
    const found = list.find(
      (item: NamespaceImport) =>
        item instanceof NamespaceImport &&
        item.path.toLowerCase() == this.path.toLowerCase() &&
        item.name == this.name,
    );

    if (!found) {
      list.push(this);
    }
  }

  public excludeFrom(list: Import[]) {
    const index = list.findIndex(
      (item: NamespaceImport) =>
        item instanceof NamespaceImport &&
        item.path.toLowerCase() == this.path.toLowerCase() &&
        item.name.toLowerCase() == this.name.toLowerCase(),
    );

    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  public isExcess(body: string[]): boolean {
    return body.indexOf(this.name) === -1;
  }

  public removeExcess(token: string[]) {
    return;
  }
}
