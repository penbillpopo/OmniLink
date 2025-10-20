import { cloneDeep } from 'lodash';
import path from 'path';
import { isLocalPath, pathCompare, toSlash } from '../tools';

export abstract class Import {
  public constructor(public path: string) {}

  public abstract toString(targetPath: string);

  public abstract mergeTo(list: Import[]);

  public abstract excludeFrom(list: Import[]);

  public abstract isExcess(body: string[]): boolean;

  public abstract removeExcess(token: string[]);

  public transformBasePath(src, dist) {
    if (this.path.substr(0, 1) == '.') {
      const _src = path.resolve(src, this.path);
      const _dist = path.resolve(dist);
      this.path = path.relative(_dist, _src);
      if (this.path[0] !== '.') this.path = './' + this.path;
    }

    return this;
  }

  public static relative(from, to) {
    from = toSlash(from);
    to = toSlash(to);

    if (!isLocalPath(to)) {
      return to;
    }

    let relative = toSlash(path.relative(from, to));
    if (!isLocalPath(relative)) {
      relative = './' + relative;
    }

    return relative;
  }

  public static resolve(base, relativized) {
    base = toSlash(base);
    relativized = toSlash(relativized);

    if (!isLocalPath(relativized)) {
      return relativized;
    }

    let resolved = toSlash(path.resolve(base, relativized));
    if (!isLocalPath(resolved)) {
      resolved = './' + resolved;
    }

    return resolved;
  }

  public static toString(list: Import[], targetPath: string) {
    return list
      .sort((a, b) => {
        const aPath = Import.relative(targetPath, a.path);
        const bPath = Import.relative(targetPath, b.path);
        return pathCompare(aPath, bPath);
      })
      .map((item) => item.toString(targetPath))
      .join('\n');
  }

  public static removeExcess(list: Import[], token: string[]): Import[] {
    list = cloneDeep(list);
    list = list.filter((item) => !item.isExcess(token));
    list.forEach((item) => item.removeExcess(token));
    return list;
  }
}
