import { fromEvent as FromEvent, merge as Merge, Observable } from 'rxjs';
import {
  filter,
  map,
  mergeMap,
  share,
  takeLast,
  takeUntil,
  tap,
} from 'rxjs/operators';

let mouseup$: Observable<Event>;

function initMouseUp() {
  mouseup$ = Merge(
    FromEvent(document.body, 'mouseup'),
    FromEvent(document.body, 'mousemove').pipe(
      filter((move: MouseEvent) => move.which == 0),
    ),
  );
}

/** Down Move Up! */
export function DMU(
  element: any,
  filterFn: (down: MouseEvent) => boolean,
  startFn: (down: MouseEvent) => void,
  transitionFn: (down: MouseEvent, move: MouseEvent) => void,
  doneFn: (down: MouseEvent, up: MouseEvent) => void,
  ngZone?: any,
) {
  if (mouseup$ == null) {
    initMouseUp();
  }

  let isFirstTime = true;

  return FromEvent(element, 'mousedown')
    .pipe(
      filter(filterFn),
      tap((event: any) => {
        isFirstTime = true;
        event.stopPropagation();
      }),
      mergeMap(
        (down) =>
          new Promise((resolve) => {
            const fn = () => {
              const moving$ = Merge(
                FromEvent(document.body, 'mousemove'),
                FromEvent(document.body, 'mouseup'),
              )
                .pipe(map((move) => [move, down]))
                .pipe(takeUntil(mouseup$))
                .pipe(share());

              moving$
                .pipe(takeLast(1))
                .subscribe(([up, down]: MouseEvent[]) => {
                  if (ngZone) {
                    ngZone.runTask(() => doneFn(down, up));
                  } else {
                    doneFn(down, up);
                  }
                });

              resolve(moving$);
            };

            if (ngZone) {
              ngZone.runOutsideAngular(() => fn());
            } else {
              fn();
            }
          }),
      ),
    )
    .pipe(
      mergeMap((rx: any) => rx),
      map(([up, down]: MouseEvent[]) => {
        if (isFirstTime) {
          isFirstTime = false;
          startFn(down);
        }

        if (ngZone) {
          ngZone.runOutsideAngular(() => transitionFn(down, up));
        } else {
          transitionFn(down, up);
        }
      }),
    );
}
