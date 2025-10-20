import { Map } from './map';

export function recursiveToMap<T = string>(
  arr: any[],
  childrenKey = 'children',
  indexKey = 'id',
  valueKey?: string,
) {
  const ret: Map<T> = {};
  const mapFunc = (data: any[]) => {
    data.forEach((item) => {
      ret[item[indexKey]] = valueKey ? item[valueKey] : item;
      if (item[childrenKey] instanceof Array) return mapFunc(item[childrenKey]);
    });
  };
  mapFunc(arr);
  return ret;
}
