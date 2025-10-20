import ts from 'typescript';

export function detectionComment(method: ts.MethodDeclaration) {
  const text = method.getSourceFile().getFullText();
  const start = method.modifiers[0].getFullStart();
  const length =
    method.modifiers[0].getFullText().length -
    method.modifiers[0].getText().length;
  let comment = text.substr(start, length);
  comment = comment.replace(/[\n\r]+/g, '\n').replace(/\n\s*$/g, '');
  return comment;
}
