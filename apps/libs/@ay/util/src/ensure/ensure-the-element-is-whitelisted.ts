export function ensureTheElementIsWhitelisted<T>(
  element: T,
  ...whitelist: T[]
): T {
  if (whitelist.includes(element)) {
    return element;
  } else {
    return whitelist[0];
  }
}
