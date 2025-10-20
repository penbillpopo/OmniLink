import { difference, union } from 'lodash';
import { Import } from './import';

export class NamedImport extends Import {
  public elements: (string | string[])[];

  public constructor(public path: string, ...elements: (string | string[])[]) {
    super(path);
    this.elements = elements;
  }

  public toString(targetPath: string) {
    const modulePath = Import.relative(targetPath, this.path);
    return `import { ${this.elements
      .map((element) => {
        if (typeof element === 'string') return element;
        else return `${element[0]} as ${element[1]}`;
      })
      .join(', ')} } from '${modulePath}';`;
  }

  public mergeTo(list: Import[]) {
    const found = list.find(
      (item: NamedImport) =>
        item instanceof NamedImport &&
        item.path.toLowerCase() == this.path.toLowerCase(),
    ) as NamedImport;

    if (found) {
      found.elements = union(found.elements, this.elements);
    } else {
      list.push(this);
    }
  }

  public excludeFrom(list: Import[]) {
    const idx = list.findIndex(
      (item) =>
        item instanceof NamedImport &&
        item.path.replace(/\\/gi, '/').toLowerCase() ==
          this.path.replace(/\\/gi, '/').toLowerCase(),
    );

    if (idx === -1) {
      return;
    }

    const _import = list[idx] as NamedImport;
    _import.elements = difference(_import.elements, this.elements);

    if (_import.elements.length !== 0) {
      return;
    }

    list.splice(idx, 1);
  }

  public isExcess(tokens: string[]): boolean {
    const elements = this.elements.filter((element) =>
      this._inToken(element, tokens),
    );

    return elements.length === 0;
  }

  private _inToken(element: string | string[], tokens: string[]) {
    return (
      (typeof element === 'string'
        ? tokens.indexOf(element)
        : tokens.indexOf(element[1])) !== -1
    );
  }

  public removeExcess(tokens: string[]) {
    this.elements = this.elements.filter((element) =>
      this._inToken(element, tokens),
    );
    return;
  }
}
