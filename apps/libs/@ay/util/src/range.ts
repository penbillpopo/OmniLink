export function limitRange(
  min = -Infinity,
  value: number,
  max = Infinity,
): number {
  if (value <= min) return min;
  else if (value >= max) return max;
  else return value;
}

export function inRange(
  min = -Infinity,
  value: number,
  max = Infinity,
): boolean {
  return min <= value && value <= max;
}
