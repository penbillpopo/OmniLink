export function ensureIsNumbers(value: string, splitter = ',') {
  return value
    .split(splitter)
    .map((val) => parseFloat(val))
    .filter((val) => !isNaN(val));
}
