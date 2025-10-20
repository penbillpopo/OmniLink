import { inArray } from './array';

export function falsy(val: any) {
  if (
    typeof val == 'string' &&
    inArray(val, ['false', 'null', 'undefined', '0', 'NaN'])
  ) {
    return false;
  } else {
    return !!val;
  }
}
