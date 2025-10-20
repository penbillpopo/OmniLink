import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export function sortList<T>(
  fn: (a: T, b: T) => number,
): OperatorFunction<T[], T[]> {
  return map((list) => {
    if (!(list instanceof Array)) return null;
    return list.sort((a: T, b: T) => fn(a, b));
  });
}
