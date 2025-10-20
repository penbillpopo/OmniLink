import { Map } from './map';

export function arrayToMap<T = string>(
  arr: any[],
  indexKey = 'id',
  valueKey?: string,
): Map<T> {
  const ret: Map<T> = {};
  arr.forEach((item) => {
    ret[item[indexKey]] = valueKey ? item[valueKey] : item;
  });
  return ret;
}
