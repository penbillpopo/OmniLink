import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import ts from 'typescript';
import { Config } from './config';
import { getRealCasePath } from './tools';

export class SharedModule {
  public controller: ts.SourceFile;
  public dtos: ts.SourceFile[] = [];
  public types: ts.SourceFile[] = [];

  public constructor(public config: Config, public name: string) {}

  public toString() {
    return this.name;
  }

  public static createModules(config: Config): SharedModule[] {
    const modules: _.Dictionary<SharedModule> = {};
    const files = readDirDeepSync(config.module);
    const program = ts.createProgram({
      rootNames: files,
      options: config.tsConfig,
    });
    program.getTypeChecker();
    const sourceFiles = program.getSourceFiles();

    const controllerRegExp = new RegExp(
      `${config.module}/([^/]*)/(.*\.controller)\.ts$`,
      'i',
    );

    const dtoRegExp = new RegExp(
      `${config.module}/([^/]*)/dto/(.*\.dto)\.ts$`,
      'i',
    );

    const typeRegExp = new RegExp(
      `${config.module}/([^/]*)/dto/(.*\.type)\.ts$`,
      'i',
    );

    sourceFiles.map((file) => {
      if (file.fileName === undefined) return;
      file.fileName = getRealCasePath(file.fileName);
      file.fileName = file.fileName.replace(/\\/gi, '/');
      const isController = controllerRegExp.exec(file.fileName);
      if (isController) {
        const [, name] = isController;
        if (modules[name] === undefined) {
          modules[name] = new SharedModule(config, name);
        }
        modules[name].controller = file;
      }

      const isDto = dtoRegExp.exec(file.fileName);
      if (isDto) {
        const [, name] = isDto;
        if (modules[name] === undefined) {
          modules[name] = new SharedModule(config, name);
        }
        modules[name].dtos.push(file);
      }

      const isType = typeRegExp.exec(file.fileName);
      if (isType) {
        const [, name] = isType;
        if (modules[name] === undefined) {
          modules[name] = new SharedModule(config, name);
        }
        modules[name].types.push(file);
      }
    });

    return Object.values(modules);
  }
}

function readDirDeepSync(parent: string): string[] {
  const children = fs.readdirSync(parent, { withFileTypes: true });

  const files = children.map((child) => {
    const res = path.resolve(parent, child.name);
    return child.isDirectory() ? readDirDeepSync(res) : res;
  });

  return files.flat();
}
