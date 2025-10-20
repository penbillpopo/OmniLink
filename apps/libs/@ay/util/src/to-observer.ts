import { from as From, Observable } from 'rxjs';
export type Func<T> = (...args: any[]) => T;
export type toObservable<T> =
  | T
  | Promise<T>
  | Observable<T>
  | Func<T>
  | Func<Promise<T>>
  | Func<Observable<T>>;
export function toObserver<T>(
  val: toObservable<T>,
  ...args: any[]
): Observable<T> {
  if (val instanceof Function) {
    val = val(...args);
  }

  if (val instanceof Observable) {
    return val;
  } else if (val instanceof Promise) {
    return From(val);
  } else {
    val = new Promise((resolve) => resolve(<any>val));
    return From(val);
  }
}
