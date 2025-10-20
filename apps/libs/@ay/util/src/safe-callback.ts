import { emptyFunction } from './empty-function';

export function safeCallback(fn: () => any) {
  if (fn instanceof Function) return fn;
  else return emptyFunction;
}
