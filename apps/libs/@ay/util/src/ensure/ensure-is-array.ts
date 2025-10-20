export function ensureIsArray<T>(value: T | T[]): T[] {
  if (value instanceof Array) return value;
  return [value];
}
