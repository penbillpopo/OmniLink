import { Map } from './map';
export function values<T>(
  obj: Map<T>,
  keyProperty: string | false = 'key',
): T[] {
  const ret = [];
  for (const i in obj) {
    ret.push(obj[i]);
    if (obj[i] instanceof Object && keyProperty) obj[i][keyProperty] = i;
  }
  return ret;
}
