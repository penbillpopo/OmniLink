import { CamelCase } from '@ay/util';
import _ from 'lodash';
import path from 'path';
import ts from 'typescript';
import { Config } from '../config';
import { ImportFactory } from '../import/factory';
import { Import as ImportType } from '../import/import';
import { NamedImport } from '../import/named-import';
import { NamespaceImport } from '../import/namespace-import';
import { Output } from '../output/output.class';
import { SharedModule } from '../shared-module';
import {
  findClass,
  findHasDecoratorMethods,
  firstClass,
  getReferencedTypes,
} from '../tools';

const defaultImports = [
  new NamedImport('@ay-nestjs/share-client', 'UploadResponse'),
];

const defaultExcludes = [
  new NamedImport('@ay-nestjs/share-server', 'Share', 'File'),
];

export class Shared extends Output {
  public imports: ImportType[] = defaultImports.slice();
  public usedTypes = ['wsc'];
  public controller: ts.ClassDeclaration;
  public dtos: ts.ClassDeclaration[] = [];

  public constructor(
    public config: Config,
    public module: SharedModule,
    public modules: SharedModule[],
  ) {
    super(`${config.dist}/src/${module.name}.ts`, config);
    this.dtos = this.module.dtos.map((dto) => firstClass(dto));
    this.controller = firstClass(this.module.controller);
  }

  public processImports() {
    const modulePath = path.resolve(
      `${this.config.module}/${this.module.name}`,
    );

    const name = CamelCase(this.module.name.replace('/', '-'));

    [
      ...ImportFactory.fromFile(this.module.controller),
      ..._.flatten(this.module.dtos.map((dto) => ImportFactory.fromFile(dto))),
      new NamedImport(`rxjs`, 'Observable'),
      new NamespaceImport(`lodash`, '_'),
      new NamedImport(`${this.config.dist}/src/wsc`, 'wsc'),
    ].map((_import) => _import.mergeTo(this.imports));

    [
      ...defaultExcludes,
      ..._.flatten(
        this.module.dtos.map((dto) => {
          if (!firstClass(dto)) {
            console.log(dto.fileName + '中沒有 CLASS 可以匯出');
            return null;
          }
          return new NamedImport(
            dto.fileName.substr(0, dto.fileName.length - 3),
            firstClass(dto).name.text,
          );
        }),
      ),
      new NamespaceImport(`${modulePath}`, name),
    ]
      .filter((_import) => Boolean(_import))
      .map((_import) => _import.excludeFrom(this.imports));
  }

  public async generateContent(): Promise<string[]> {
    this.processImports();

    let content = [];

    const controller = findClass(this.module.controller, 'Controller');
    if (controller === undefined) return;

    if (this.dtos.length) {
      content.push(``);
      content = content.concat(...this.generateDtoContent());
    }

    if (this.controller) {
      content.push(``);
      content = content.concat(...this.generateModelContent());
    }

    content = [this._generateImportsContent()].concat(content);

    return content;
  }

  private _generateImportsContent() {
    this.usedTypes = this.usedTypes
      .filter((type) => type !== undefined)
      .map((types) => types.split('.')[0]);
    this.usedTypes = this.usedTypes.filter(
      (word, i) => this.usedTypes.indexOf(word) === i,
    );
    this.imports = ImportType.removeExcess(this.imports, this.usedTypes);

    return ImportType.toString(this.imports, `${this.config.dist}/src/`);
  }

  public addUsedTypes(type: ts.TypeNode) {
    const types = getReferencedTypes(type);
    this.usedTypes = this.usedTypes.concat(types);
  }

  public generateDtoContent(): string[] {
    this.dtos.map((dto) =>
      ts.forEachChild(dto, (node) => {
        switch (node.kind) {
          case ts.SyntaxKind.PropertyDeclaration:
            const property = node as ts.PropertyDeclaration;
            this.addUsedTypes(property.type);
            break;

          case ts.SyntaxKind.HeritageClause:
            const heritageClause = node as ts.HeritageClause;
            if (heritageClause.types === undefined) return;
            heritageClause.types.map((type) => this.addUsedTypes(type));
            break;

          case ts.SyntaxKind.IndexSignature:
            const indexSignature = node as ts.IndexSignatureDeclaration;
            this.addUsedTypes(indexSignature.type);
            break;

          case ts.SyntaxKind.Identifier:
          case ts.SyntaxKind.ExportKeyword:
          case ts.SyntaxKind.CatchClause:
            break;

          default:
            console.error(
              `generateDtoContent UNKNOWN ${node.kind} `,
              node.getText(),
            );
        }
      }),
    );

    return this.dtos.map((dto) => dto.getText());
  }

  public generateModelContent(): string[] {
    let content = [];
    content.push(`export class ${CamelCase(this.module.name)}Model {`);

    findHasDecoratorMethods(this.controller, 'Share').map((method) => {
      const methodName = method.name.getText();

      const params = method.parameters
        .map((parameter) => this._processParameter(parameter))
        .filter((parameter) => parameter);

      const hasFile = params.reduce(
        (prev, curr) => prev || curr.type === 'File',
        false,
      );

      if (method.type) {
        this.addUsedTypes(method.type);
      }

      const { methodType, returnType } = this._detectionMethodType(
        hasFile,
        method.type ? method.type.getText() : 'any',
      );

      const comment = this._detectionComment(method);

      const parametersString = [`'/ws/${this.module.name}/${methodName}'`]
        .concat(params.map((param) => param.name))
        .join(', ');

      content = content.concat(
        comment,
        `static ${methodName}(`,
        ...params.map((param) => `${param.define},`),
        `): ${returnType} {`,
        `return wsc.${methodType}(${parametersString}) as any;`,
        `}`,
      );
    });

    content.push(`}`);

    return content;
  }

  private _detectionComment(method: ts.MethodDeclaration) {
    const text = method.getSourceFile().getFullText();
    const start = method.modifiers[0].getFullStart();
    const length =
      method.modifiers[0].getFullText().length -
      method.modifiers[0].getText().length;
    let comment = text.substr(start, length);
    comment = comment.replace(/[\n\r]+/g, '\n').replace(/\n\s*$/g, '');
    return comment;
  }

  private _detectionMethodType(hasFile: boolean, returnType: string) {
    let methodType = '';

    if (hasFile) {
      returnType = returnType.replace(/Promise<(.*)>/gi, '$1');
      methodType = 'upload';
      returnType = `Observable<UploadResponse<${returnType}>>`;
      this.usedTypes.push('Observable');
      this.usedTypes.push('UploadResponse');
    } else if (
      returnType.indexOf('Observable<') !== -1 ||
      returnType.indexOf('Subject<') !== -1
    ) {
      methodType = 'subscribe';
      returnType = returnType.replace(/Promise<(.*)>/gi, '$1');
    } else {
      if (returnType.indexOf('Promise<') === -1) {
        returnType = `Promise< ${returnType}>`;
      }
      methodType = 'execute';
    }

    return { methodType, returnType };
  }

  private _processParameter(parameter) {
    const fullText = parameter.name.getFullText();
    const name = parameter.name.getText();
    const comment = fullText.substr(0, fullText.length - name.length).trim();
    const type = parameter.type ? parameter.type.getText() : 'any';
    let define = '';

    if (parameter.decorators) {
      const decorators = parameter.decorators.map((decorator) =>
        decorator.getText(),
      );

      const ignoreDecorators = ['@User()', '@Session()'];
      if (
        decorators.find((decorator) => ignoreDecorators.includes(decorator))
      ) {
        return;
      }
    }

    if (parameter.type) {
      this.addUsedTypes(parameter.type);
    }

    if (comment) {
      define += comment + '\n';
    }

    define += name;

    if (parameter.questionToken) {
      define += '?';
    }

    if (parameter.type) {
      define += ':' + type;
    }

    if (parameter.initializer) {
      define += '=' + parameter.initializer.getText();
    }

    return { type, name, define };
  }
}
