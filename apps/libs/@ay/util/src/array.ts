export function inArray<T>(obj: T, arr: T[]) {
  return arr.indexOf(obj) !== -1;
}

export function toArray<T>(input: T): T[] {
  if (input instanceof Array) return input;
  return [input];
}
