import * as glob from 'glob';
import ts, {
  ArrayTypeNode,
  IntersectionTypeNode,
  PropertySignature,
  SignatureDeclarationBase,
  SyntaxKind,
  TypeLiteralNode,
  TypeReferenceNode,
  UnionTypeNode,
} from 'typescript';

export function getRealCasePath(path) {
  const realCasePath = glob.sync(path, { nocase: true })[0];
  return realCasePath ? realCasePath : path;
}

export function isClass(member: ts.Node) {
  return member.kind === ts.SyntaxKind.ClassDeclaration;
}

export function isType(member: ts.Node) {
  return member.kind === ts.SyntaxKind.TypeAliasDeclaration;
}

export function isNamespace(member: ts.Node) {
  return member.kind === ts.SyntaxKind.ModuleDeclaration;
}

export function isMethod(member: ts.ClassElement): boolean {
  return member.kind == ts.SyntaxKind.MethodDeclaration;
}

export function isStatic(member: ts.ClassElement): boolean {
  return (
    member.modifiers.find(
      (modifier) => modifier.kind == ts.SyntaxKind.StaticKeyword,
    ) !== undefined
  );
}

export function hasDecorator(
  name: string,
): (member: ts.ClassElement) => boolean {
  return (member: ts.ClassElement) => {
    return findFunctionDecorator(member, name).length !== 0;
  };
}

export function findNamespace(
  file: ts.SourceFile,
  namespaceName: string,
): ts.NamespaceExportDeclaration {
  let __namespace: ts.NamespaceExportDeclaration;
  ts.forEachChild(file, (member: ts.NamespaceExportDeclaration) => {
    if (!isNamespace(member)) return;
    if (member.name.getText() !== namespaceName) return;
    __namespace = member;
  });
  return __namespace;
}

export function firstClass(file: ts.SourceFile) {
  let __class: ts.ClassDeclaration = null;
  ts.forEachChild(file, (member: ts.ClassDeclaration) => {
    if (!isClass(member)) return;
    if (__class) return;
    __class = member;
  });
  return __class;
}

export function firstType(file: ts.SourceFile) {
  let __type: ts.TypeAliasDeclaration = null;
  ts.forEachChild(file, (member: ts.TypeAliasDeclaration) => {
    if (!isType(member)) return;
    if (__type) return;
    __type = member;
  });
  return __type;
}

export function findClass(
  file: ts.SourceFile,
  className: string,
): ts.ClassDeclaration {
  let __class: ts.ClassDeclaration = null;
  ts.forEachChild(file, (member: ts.ClassDeclaration) => {
    if (!isClass(member)) return;
    if (member.name.getText() !== className) return;
    __class = member;
  });
  return __class;
}

export function findHasDecoratorMethods(
  __class: ts.ClassDeclaration,
  decoratorName: string,
): ts.MethodDeclaration[] {
  if (__class === null) return [];
  try {
    return __class.members
      .filter(isMethod)
      .filter(hasDecorator(decoratorName)) as ts.MethodDeclaration[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function isFunctionDecorator(decorator: ts.Decorator) {
  return decorator.expression.kind === ts.SyntaxKind.CallExpression;
}

export function decoratorNameIs(name: string) {
  return (decorator: ts.Decorator) => {
    if (decorator.expression.kind === ts.SyntaxKind.CallExpression) {
      const callExpression = decorator.expression as ts.CallExpression;
      return callExpression.expression.getText() === name;
    } else {
      return decorator.expression.getText() === name;
    }
  };
}

export function findFunctionDecorator(element: ts.ClassElement, name: string) {
  if (element.decorators === undefined) return [];
  return element.decorators
    .filter(isFunctionDecorator)
    .filter(decoratorNameIs(name));
}

export function getDecoratorArguments(decorator: ts.Decorator) {
  if (decorator.expression.kind !== ts.SyntaxKind.CallExpression) {
    return [];
  }
  const callExpression = decorator.expression as ts.CallExpression;
  return callExpression.arguments.map((argument) => argument.getText());
}

export function isExtraType(type: ts.TypeNode | string) {
  if (typeof type !== 'string') {
    type = type.getText();
  }

  switch (type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'any':
    case 'string[]':
    case 'number[]':
    case 'boolean[]':
    case 'any[]':
      return false;

    default:
      return true;
  }
}

export function isArrayType(type: ts.TypeNode | string) {
  if (typeof type !== 'string') {
    type = type.getText();
  }

  return type.substr(-2) === '[]';
}

export function getReferencedTypes(type: ts.TypeNode) {
  switch (type.kind) {
    case SyntaxKind.UnionType:
      return (type as UnionTypeNode).types.reduce(
        (types, type) => types.concat(getReferencedTypes(type)),
        [],
      );

    case SyntaxKind.IntersectionType: {
      return (type as IntersectionTypeNode).types.reduce(
        (types, type) => types.concat(getReferencedTypes(type)),
        [],
      );
    }

    case SyntaxKind.ArrayType:
      return getReferencedTypes((type as ArrayTypeNode).elementType);

    case SyntaxKind.TypeLiteral:
      return (type as TypeLiteralNode).members.reduce((types, member) => {
        switch (member.kind) {
          case SyntaxKind.PropertySignature:
            return types.concat(
              getReferencedTypes((member as PropertySignature).type),
            );

          case SyntaxKind.MethodSignature:
          case SyntaxKind.IndexSignature:
            const methodSignature = member as any as SignatureDeclarationBase;
            types = types.concat(getReferencedTypes(methodSignature.type));
            types = types.concat(
              methodSignature.parameters.reduce(
                (types, parameter) =>
                  types.concat(getReferencedTypes(parameter.type)),
                [],
              ),
            );
            return;

          case SyntaxKind.MissingDeclaration:
          case SyntaxKind.ConstructSignature:
          case SyntaxKind.CallSignature:
            throw '尚未實作,' + member.kind;
        }
        return types;
      }, []);

    case SyntaxKind.TypeReference: {
      const typeReferenceNode = type as TypeReferenceNode;
      let types = [];
      if (typeReferenceNode.typeArguments) {
        types = types.concat(
          typeReferenceNode.typeArguments.reduce(
            (types, argument) => types.concat(getReferencedTypes(argument)),
            [],
          ),
        );
        return [typeReferenceNode.getText().split('<')[0], ...types];
      }

      return [typeReferenceNode.getText()];
    }

    case SyntaxKind.NumberKeyword:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.LiteralType:
      return [];

    case SyntaxKind.ExpressionWithTypeArguments:
      return [(type as ts.ExpressionWithTypeArguments).expression.getText()];

    case SyntaxKind.ConstructorType: {
      const t = type as ts.ConstructorTypeNode;
      return getReferencedTypes(t.type);
    }

    case SyntaxKind.ParenthesizedType: {
      const t = type as ts.ParenthesizedTypeNode;
      return getReferencedTypes(t.type);
    }

    case SyntaxKind.VoidKeyword: {
      return [];
    }

    case SyntaxKind.FunctionType: {
      const functionNode = type as ts.FunctionTypeNode;
      let types = [];

      if (functionNode.parameters) {
        functionNode.parameters.map((parameter) => {
          types = types.concat(getReferencedTypes(parameter.type));
        });
      }

      types.push(functionNode.type.getText());
      return types;
    }

    default:
      throw '尚未實作,' + type.kind + '(' + type.getText() + ')';
  }

  return [];
}

export function toSlash(path: string) {
  return path.replace(/\\/gi, '/');
}

export function isWindowsPath(path: string) {
  return /^\w+\:/.test(path);
}

export function isLocalPath(path) {
  const firstChar = path.substr(0, 1);
  return firstChar === '.' || firstChar === '/' || isWindowsPath(path);
}

export function pathCompare(a: string, b: string) {
  const aPath = a.split('/');
  const bPath = b.split('/');
  let ai = 0;
  let bi = 0;

  while (ai < aPath.length && bi < bPath.length) {
    if (aPath[ai] === '.' && bPath[bi] !== '.') {
      return 1;
    } else if (bPath[bi] === '.' && aPath[ai] !== '.') {
      return -1;
    } else if (aPath[ai] === bPath[bi]) {
      ai++;
      bi++;
    } else if (aPath[ai] === '..' && bPath[bi] !== '..') {
      return -1;
    } else if (bPath[bi] === '..' && aPath[ai] !== '..') {
      return 1;
    } else {
      return aPath[ai].localeCompare(bPath[bi], 'en', {
        sensitivity: 'base',
      });
    }
  }
}
