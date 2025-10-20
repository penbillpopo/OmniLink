import path from 'path';
import ts from 'typescript';
import { DefaultImport } from './default-import';
import { Import } from './import';
import { NamedImport } from './named-import';
import { NamespaceImport } from './namespace-import';

export class ImportFactory {
  public static fromFile(file: ts.SourceFile): Import[] {
    const list: Import[] = [];

    ts.forEachChild(file, (node) => {
      if (node.kind !== ts.SyntaxKind.ImportDeclaration) {
        return;
      }

      const sourceFile = node.getSourceFile();
      if (sourceFile === undefined) {
        throw { file, node };
      }

      list.push(
        ImportFactory.fromImportDeclaration(
          node as ts.ImportDeclaration,
          path.resolve(file.fileName, '..'),
        ),
      );
    });
    return list;
  }

  public static fromImportDeclaration(
    _import: ts.ImportDeclaration,
    basePath: string,
  ): Import {
    try {
      let modulePath = (_import.moduleSpecifier as any).text;
      modulePath = Import.resolve(basePath, modulePath);

      const importClause = _import.importClause;
      const namedBindings = importClause.namedBindings;

      if (namedBindings === undefined) {
        return new DefaultImport(modulePath, importClause.name.getText());
      }

      switch (namedBindings.kind) {
        case ts.SyntaxKind.NamespaceImport: {
          return new NamespaceImport(modulePath, namedBindings.name.getText());
        }

        case ts.SyntaxKind.NamedImports: {
          return new NamedImport(
            modulePath,
            ...namedBindings.elements
              .filter((element) => element)
              .map((element) => {
                if (element.propertyName) {
                  return [element.propertyName.getText(), element.getText()];
                }
                return element.getText();
              }),
          );
        }

        default:
          throw `UNSUPPORTED TYPE`;
      }
    } catch (e) {
      console.error(e);
    }
  }
}
