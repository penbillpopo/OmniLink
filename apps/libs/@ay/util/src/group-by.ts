import { Map } from './map';

export function groupBy<T>(arr: T[], key: keyof T): Map<T[]> {
  const grouped: Map<T[]> = {};

  for (const item of arr) {
    const field = item[key] + '';
    if (grouped[field] === undefined) {
      grouped[field] = [];
    }
    grouped[field].push(item);
  }
  return grouped;
}
