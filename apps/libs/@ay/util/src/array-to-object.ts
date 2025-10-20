export function arrayToObject<T>(
  array: T[],
  key: string,
): { [key: string]: T } {
  const map: {
    [key: string]: T;
  } = {};
  array.forEach((item) => (map[item[key]] = item));
  return map;
}
