import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export function asyncObservableWrap<T>(
  fn: () => Promise<Observable<T>>,
): Observable<T> {
  return of([1]).pipe(
    switchMap((_) => fn()),
    switchMap((subject) => subject as any),
  ) as any;
}
