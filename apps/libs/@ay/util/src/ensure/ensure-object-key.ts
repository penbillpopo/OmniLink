export function ensureObjectKey<T>(
  object: any,
  key: string | number,
  defaultValue: T,
): T {
  if (object[key] === undefined) {
    object[key] = defaultValue;
  }
  return object[key];
}
