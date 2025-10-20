import { CamelCase } from '@ay/util';
import path from 'path';
import ts from 'typescript';
import { Config } from '../config';
import { ImportFactory } from '../import/factory';
import { Import as ImportType } from '../import/import';
import { NamedImport } from '../import/named-import';
import { NamespaceImport } from '../import/namespace-import';
import { SharedModule } from '../shared-module';
import { firstType, getReferencedTypes } from '../tools';
import { Output } from './output.class';

const defaultImports = [
  new NamedImport('@ay-nestjs/share-client', 'UploadResponse'),
];

const defaultExcludes = [
  new NamedImport('@ay-nestjs/share-server', 'Share', 'File'),
];

export class Type extends Output {
  public imports: ImportType[] = defaultImports.slice();
  public usedTypes = [];
  public type: ts.TypeAliasDeclaration;

  public constructor(
    public config: Config,
    public module: SharedModule,
    public sourceFile: ts.SourceFile,
  ) {
    super(
      `${config.dist}/src/${module.name}/dto/${path.basename(
        sourceFile.fileName,
      )}`,
      config,
    );
    this.type = firstType(this.module.controller);
  }

  public processImports() {
    const modulePath = path.resolve(
      `${this.config.module}/${this.module.name}/dto`,
    );

    const name = CamelCase(this.module.name.replace('/', '-'));
    const config = this.config;

    [
      ...ImportFactory.fromFile(this.sourceFile),
      new NamedImport(`rxjs`, 'Observable'),
      new NamespaceImport(`lodash`, '_'),
      new NamedImport(`${config.dist}/src/wsc`, 'wsc'),
    ].map((_import) => _import.mergeTo(this.imports));

    [...defaultExcludes, new NamespaceImport(`${modulePath}`, name)]
      .filter((_import) => Boolean(_import))
      .map((_import) => _import.excludeFrom(this.imports));
  }

  public async generateContent(): Promise<string[]> {
    this.processImports();

    const type = firstType(this.sourceFile);

    this._importUsed(type);

    let content = [];
    content.push(``);
    content = content.concat(...this.generateTypeContent());

    content = [this._generateImportsContent()].concat(content);

    return content;
  }

  private _importUsed(type: ts.TypeAliasDeclaration | ts.TypeLiteralNode) {
    ts.forEachChild(type, (node) => {
      switch (node.kind) {
        case ts.SyntaxKind.PropertySignature: {
          const property = node as ts.PropertySignature;
          this.addUsedTypes(property.type);
          break;
        }

        case ts.SyntaxKind.PropertyDeclaration: {
          const property = node as ts.PropertyDeclaration;
          this.addUsedTypes(property.type);
          break;
        }

        case ts.SyntaxKind.HeritageClause: {
          const heritageClause = node as ts.HeritageClause;
          if (heritageClause.types === undefined) return;
          heritageClause.types.map((type) => this.addUsedTypes(type));
          break;
        }

        case ts.SyntaxKind.IndexSignature: {
          const indexSignature = node as ts.IndexSignatureDeclaration;
          this.addUsedTypes(indexSignature.type);
          break;
        }

        case ts.SyntaxKind.ClassDeclaration:

        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.ExportKeyword:
        case ts.SyntaxKind.CatchClause:
          break;

        case ts.SyntaxKind.TypeReference: {
          const typeReferenceNode = node as ts.TypeReferenceNode;
          if (typeReferenceNode.typeArguments) {
            typeReferenceNode.typeArguments.map((type) =>
              this.addUsedTypes(type),
            );
          } else {
            this.addUsedTypes(typeReferenceNode);
          }
          break;
        }

        case ts.SyntaxKind.UnionType: {
          const unionTypeNode = node as ts.UnionTypeNode;
          unionTypeNode.types.map((type) => this.addUsedTypes(type));
          break;
        }

        case ts.SyntaxKind.IntersectionType: {
          const intersectionTypeNode = node as ts.IntersectionTypeNode;
          intersectionTypeNode.types.map((type) => this.addUsedTypes(type));
          break;
        }

        case ts.SyntaxKind.TypeLiteral: {
          this._importUsed(node as ts.TypeLiteralNode);
          break;
        }

        case ts.SyntaxKind.ArrayType: {
          const arrayTypeNode = node as ts.ArrayTypeNode;
          this.addUsedTypes(arrayTypeNode.elementType);
          break;
        }

        default:
          console.error(`_importUsed UNKNOWN ${node.kind} `, node.getText());
      }
    });
  }

  private _generateImportsContent() {
    this.usedTypes = this.usedTypes
      .filter((type) => type !== undefined)
      .map((types) => types.split('.')[0]);

    this.usedTypes = this.usedTypes.filter(
      (word, i) => this.usedTypes.indexOf(word) === i,
    );

    this.imports = ImportType.removeExcess(this.imports, this.usedTypes);

    this.imports.map((Import) => {
      Import.path = Import.path.replace(
        this.config.module,
        this.config.dist + '/src',
      );
    });

    return ImportType.toString(
      this.imports,
      `${this.config.dist}/src/${this.module.name}/dto`,
    );
  }

  public addUsedTypes(type: ts.TypeNode) {
    const types = getReferencedTypes(type);
    this.usedTypes = this.usedTypes.concat(types);
  }

  public generateTypeContent(): string[] {
    return [firstType(this.sourceFile).getText()];
  }
}
