export function ensureTheElementsAreWhitelisted<T>(
  array: T[],
  ...whitelist: T[]
) {
  return array.filter((element) => whitelist.includes(element));
}
