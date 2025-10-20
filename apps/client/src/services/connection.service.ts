import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import { wsc } from '@ay-gosu/server-shared';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';

type LogEvent = {
  type: string;
  target?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ConnectionService implements OnDestroy {
  public server: string;

  public destroy$ = new Subject<void>();

  public status$ = new BehaviorSubject<boolean>(false);

  public log$ = new BehaviorSubject<LogEvent>({ type: '就緒' });

  public version$ = this.status$.pipe(
    filter((status) => status),
    map((status) => wsc.serverVersion),
  );

  public _connectMonitor = this.status$
    .pipe(filter((status) => status))
    .subscribe((status) => {
      console.log('成功與伺服器建立連線');
    });

  private _logNotifyHandle = this.log$
    .pipe(takeUntil(this.destroy$))
    .subscribe((event) => {
      this.server = null;
      console.info(
        `[連線狀態] ${event.type} ${event.target ? `: ${event.target}` : ''}`,
      );

      switch (event.type) {
        case '伺服器皆無回應':
          console.log('伺服器皆無回應');
          break;

        case '嘗試重新連線':
          console.log('嘗試重新連線');
          break;

        case '連線至伺服器':
          console.log('嘗試與伺服器連線');
          this.server = event.target;
          break;
      }
    });

  private _catchEvent = wsc.status.subscribe((type) => {
    this.log$.next({ type, target: wsc.connectedServer });

    let status = type === '連線至伺服器';
    if (this.status$.value === status) return;
    this.status$.next(status);
  });

  public async awaitConnected() {
    return firstValueFrom(this.status$.pipe(first((status) => status)));
  }

  public constructor(public applicationRef: ApplicationRef) {
    wsc.connect(environment.serverUrl[0]);

    console.log('嘗試與伺服器連線');

    window['disconnect'] = () => {
      this.status$.next(false);
      applicationRef.tick();
    };

    window['connect'] = () => {
      this.status$.next(true);
      applicationRef.tick();
    };
  }

  public ngOnDestroy() {
    this.destroy$.complete();
  }
}
