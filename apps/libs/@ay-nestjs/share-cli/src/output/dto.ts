import { CamelCase } from '@ay/util';
import path from 'path';
import ts from 'typescript';
import { Config } from '../config';
import { ImportFactory } from '../import/factory';
import { Import as ImportType } from '../import/import';
import { NamedImport } from '../import/named-import';
import { NamespaceImport } from '../import/namespace-import';
import { SharedModule } from '../shared-module';
import { firstClass, getReferencedTypes } from '../tools';
import { Output } from './output.class';

const defaultImports = [
  new NamedImport('@ay-nestjs/share-client', 'UploadResponse'),
];

const defaultExcludes = [
  new NamedImport('@ay-nestjs/share-server', 'Share', 'File'),
];

export class Dto extends Output {
  public imports: ImportType[] = defaultImports.slice();
  public usedTypes = [];
  public controller: ts.ClassDeclaration;

  public constructor(
    public config: Config,
    public module: SharedModule,
    public dto: ts.SourceFile,
  ) {
    super(
      `${config.dist}/src/${module.name}/dto/${path.basename(dto.fileName)}`,
      config,
    );
    this.controller = firstClass(this.module.controller);
  }

  public async generateContent(): Promise<string[]> {
    this._processImports();

    ts.forEachChild(firstClass(this.dto), (node) => {
      switch (node.kind) {
        case ts.SyntaxKind.MethodDeclaration:
          const method = node as ts.MethodDeclaration;
          if (method.name.getText() === 'toJSON') {
            this._addUsedTypes(method.type);
          }

          if (method.name.getText() === 'constructor') {
            method.parameters.map((parameter) => {
              this._addUsedTypes(parameter.type);
            });
          }

          if (method.name.getText() === 'toLogString') {
            this._addUsedTypes(method.type);
          }
          break;

        case ts.SyntaxKind.PropertyDeclaration:
          const property = node as ts.PropertyDeclaration;
          if (property.type) {
            this._addUsedTypes(property.type);
          }
          break;

        case ts.SyntaxKind.HeritageClause:
          const heritageClause = node as ts.HeritageClause;
          if (heritageClause.types === undefined) return;
          heritageClause.types.map((type) => this._addUsedTypes(type));
          break;

        case ts.SyntaxKind.IndexSignature:
          const indexSignature = node as ts.IndexSignatureDeclaration;
          this._addUsedTypes(indexSignature.type);
          break;

        case ts.SyntaxKind.ClassDeclaration:

        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.ExportKeyword:
        case ts.SyntaxKind.CatchClause:
          break;

        case ts.SyntaxKind.TypeParameter:
          const typeParameter = node as ts.TypeParameterDeclaration;
          if (typeParameter.constraint) {
            this._addUsedTypes(typeParameter.constraint);
          }
          if (typeParameter.default) {
            this._addUsedTypes(typeParameter.default);
          }
          break;

        case ts.SyntaxKind.Constructor:
          const constructor = node as ts.ConstructorDeclaration;
          constructor.parameters.map((parameter) => {
            this._addUsedTypes(parameter.type);
          });
          break;

        default:
          console.error(
            `generateContent UNKNOWN ${node.kind} `,
            node.getText(),
            this.dto.fileName,
          );
      }
    });

    let content = [];
    content.push(``);
    content = content.concat(...this._generateDtoContent());

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

    this.imports.map((_import) => {
      if (_import.path.includes('dto')) {
        _import.path = _import.path.replace(
          this.config.module,
          this.config.dist + '/src',
        );
      }
    });

    return ImportType.toString(
      this.imports,
      `${this.config.dist}/src/${this.module.name}/dto`,
    );
  }

  private _processImports() {
    const filePath = path.resolve(
      `${this.config.module}/${this.module.name}/dto`,
    );

    const name = CamelCase(this.module.name.replace('/', '-'));
    const config = this.config;

    [
      ...ImportFactory.fromFile(this.dto),
      new NamedImport(`rxjs`, 'Observable'),
      new NamespaceImport(`lodash`, '_'),
      new NamedImport(`${config.dist}/src/wsc`, 'wsc'),
    ].map((_import) => _import.mergeTo(this.imports));

    [...defaultExcludes, new NamespaceImport(`${filePath}`, name)]
      .filter((Import) => Boolean(Import))
      .map((Import) => Import.excludeFrom(this.imports));
  }

  private _addUsedTypes(type: ts.TypeNode) {
    if (type === undefined) return;
    const types = getReferencedTypes(type);
    this.usedTypes = this.usedTypes.concat(types);
  }

  private _generateDtoContent(): string[] {
    return [firstClass(this.dto).getText()];
  }
}
