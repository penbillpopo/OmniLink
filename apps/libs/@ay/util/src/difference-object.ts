export function differenceObject<T extends { [key: string]: any }>(
  target: T,
  origin: T,
): T {
  const value: T = {} as any;

  for (const key in target) {
    if (target[key] !== origin[key]) {
      if ((target[key] as any) instanceof Object) {
        value[key] = differenceObject(target[key], origin[key]);
        if (Object.keys(value[key]).length === 0) {
          delete value[key];
        }
      } else {
        value[key] = target[key];
      }
    }
  }

  return value;
}
