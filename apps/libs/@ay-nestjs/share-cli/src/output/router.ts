import { CamelCase, falsy, safeJsonParse } from '@ay/util';
import ts from 'typescript';
import { Config } from '../config';
import { Import } from '../import/import';
import { NamedImport } from '../import/named-import';
import { NamespaceImport } from '../import/namespace-import';
import { SharedModule } from '../shared-module';
import { findHasDecoratorMethods, firstClass } from '../tools';
import { Output } from './output.class';

const defaultImports = [
  new NamedImport('@ay-nestjs/share-server', 'wss'),
  new NamespaceImport('express', 'express'),
];

export class Router extends Output {
  public constructor(public config: Config, public module: SharedModule) {
    super(`${config.module}/${module.name}/router.ts`, config);
  }

  public async generateContent(): Promise<string[]> {
    let content: string[] = [];

    const controller = firstClass(this.module.controller);
    if (controller === undefined) {
      throw 'NO CONTROLLER';
    }
    const imports = this.processImports();

    content.push(
      Import.toString(imports, `${this.config.module}/${this.module.name}/`),
    );

    const method = `load${CamelCase(this.module.name.replace('/', '-'))}`;
    content.push(``);
    content.push(`export function ${method}() {`);

    findHasDecoratorMethods(controller, 'Share').map((method) => {
      content = content.concat(...this.generateMethodContent(method));
    });

    content.push(`}`);

    return content;
  }

  public processImports() {
    if (this.module.controller === undefined) return [];
    const imports = [
      new NamedImport(
        this.module.controller.fileName.substr(
          0,
          this.module.controller.fileName.length - 3,
        ),
        CamelCase(this.module.name) + 'Controller',
      ),
    ];
    defaultImports.map((_import) => _import.mergeTo(imports));
    return imports;
  }

  public generateMethodContent(method: ts.MethodDeclaration) {
    const moduleName = this.module.name;
    const methodName = method.name.getText();

    const params = this._processParameters(method);
    const ModuleName = CamelCase(this.module.name.replace('/', '-'));

    const paramStrings = params
      .map((params) => JSON.stringify(params, null, 2))
      .join(',\n');

    return [
      `  wss.on({
    "path": "/ws/${moduleName}/${methodName}",
    "controller": ${ModuleName}Controller,
    "method": "${methodName}",
    "rules": [${paramStrings}]
  });\n`,
    ];
  }

  private _processParameters(method: ts.MethodDeclaration) {
    return method.parameters.map((parameter) => {
      const name = parameter.name.getText();

      let type = parameter.type
        ? parameter.type.getText().replace(/\n/gi, '')
        : undefined;

      let initializer;
      try {
        initializer = parameter.initializer
          ? safeJsonParse(
              parameter.initializer.getText(),
              parameter.initializer.getText(),
            )
          : undefined;
        if (
          typeof initializer === 'string' &&
          initializer[0] === "'" &&
          initializer[initializer.length - 1] === "'"
        ) {
          initializer = initializer.substring(1, initializer.length - 1);
        }
      } catch (error) {
        console.log(error, parameter.initializer.getText());
      }

      if (type === undefined) {
        type = typeof initializer;
      }

      const required = !falsy(parameter.questionToken || parameter.initializer);

      let decorators = undefined;

      if (parameter.decorators) {
        decorators = parameter.decorators.map((decorator) =>
          decorator.getText(),
        );
      }

      return { name, type, initializer, required, decorators };
    });
  }
}
