import { concat, from, Observable, of, OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, mergeMap } from 'rxjs/operators';

export enum AsyncJobStatusEnum {
  LOADING,
  SUCCESS,
  EMPTY,
  ERROR,
}

const { LOADING, SUCCESS, EMPTY, ERROR } = AsyncJobStatusEnum;

export class AsyncJob<O> {
  public constructor(
    public readonly status: AsyncJobStatusEnum,
    public readonly value: O = null,
  ) {}
}

export function asyncJob<P, O>(
  fn: (item: P) => PromiseLike<O> | O,
): OperatorFunction<P, AsyncJob<O>> {
  return pipe(
    mergeMap(async (params: P) => {
      // 如果 params 中有任一個是 LOADING 或 ERROR，就直接回傳
      if (params instanceof Array) {
        for (let param of params) {
          if (
            param instanceof AsyncJob &&
            [LOADING, ERROR].includes(param.status)
          ) {
            return of(param as any);
          }
        }
      }

      // 如果 params 為 LOADING 或 ERROR，就直接回傳
      if (
        params instanceof AsyncJob &&
        [LOADING, ERROR].includes(params.status)
      ) {
        return of(params as any);
      }

      return new Promise<Observable<AsyncJob<O>>>((resolve) => {
        const response = Promise.resolve(fn(params)).then((response) => {
          const isEmpty =
            response === null ||
            response === undefined ||
            (response instanceof Array && response.length === 0);

          if (isEmpty) {
            return new AsyncJob(EMPTY, response);
          }

          return new AsyncJob(SUCCESS, response);
        });

        const timer = setTimeout(() => {
          resolve(concat(of(new AsyncJob<O>(LOADING)), from(response)));
        }, 500);

        response.then((response) => {
          clearTimeout(timer);
          resolve(of(response));
        });
      });
    }),
    mergeMap((value) => value),
    distinctUntilChanged(
      (a: AsyncJob<O>, b: AsyncJob<O>) =>
        a.status === b.status && a.status === LOADING,
    ),
  );
}
