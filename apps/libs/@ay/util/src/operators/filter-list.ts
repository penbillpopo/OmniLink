import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export function filterList<T>(
  fn: (item: T, index: number, array: T[]) => boolean,
): OperatorFunction<T[], T[]> {
  return map((list) => {
    if (!(list instanceof Array)) {
      return null;
    }
    return list.filter((item, index, array) => fn(item, index, array));
  });
}
