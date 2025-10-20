import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AccountModel, UserDto } from '@ay-gosu/server-shared';
import * as jwt from 'jwt-decode';
import {
  BehaviorSubject,
  ReplaySubject,
  Subject,
  combineLatest,
  firstValueFrom,
} from 'rxjs';
import {
  combineLatestWith,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  skip,
  takeUntil,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AsyncJobStatusEnum, asyncJob } from '../util/async-job/async-job';
import { ConnectionService } from './connection.service';
@Injectable({
  providedIn: 'root',
})
export class TokenService implements OnDestroy {
  public destroy$ = new Subject();

  public token$ = new ReplaySubject<string>(1);

  public connectedToken$ = this._connectionService.status$.pipe(
    combineLatestWith(this.token$),
    map(([status, token]) => (status ? token : null)),
    asyncJob(async (token) => {
      try {
        if (token) {
          return await AccountModel.loginViaToken(token);
        }

        return null;
      } catch (error) {
        console.error(error);
      }
    }),
    asyncJob((job) => this._decodeToken(job.value)),
    shareReplay(1),
  );

  private connectedTokenAccount$ = this.connectedToken$.pipe(
    filter((job) => job.status !== AsyncJobStatusEnum.LOADING),
    map((job) => {
      if (job.status === AsyncJobStatusEnum.ERROR) {
        return null;
      }
      return job.value;
    }),
    distinctUntilChanged((prev, curr) => prev?.accountId === curr?.accountId),
  );

  private accountSubject$: BehaviorSubject<UserDto> = new BehaviorSubject(null);

  public account$ = combineLatest(
    this.connectedTokenAccount$,
    this.accountSubject$,
  ).pipe(map(([c, a]) => c || a));

  private _storageTokenToLocalStorage = this.token$
    .pipe(skip(1), takeUntil(this.destroy$))
    .subscribe((token) => {
      if (token) {
        window.localStorage.setItem(environment.loginTokenKey, token);
      } else {
        window.localStorage.removeItem(environment.loginTokenKey);
      }
    });

  private _applyTokeToWebsocket = this.connectedToken$
    .pipe(takeUntil(this.destroy$))
    .subscribe(async (account) => {
      try {
        await AccountModel.isLoggedIn();
      } catch (err) {
        if (!account.value) {
          this.token$.next('');
        }
      }
    });

  private _loginByStorageTokenPromise = this._loginByStorageToken();

  public constructor(
    private readonly _connectionService: ConnectionService,
    private readonly _router: Router,
  ) {}

  public ngOnDestroy() {
    this.destroy$.complete();
  }

  public async isLoggedIn(): Promise<boolean> {
    await this._loginByStorageTokenPromise;
    return firstValueFrom(this.account$)
      .then((res) => !!res)
      .catch((err) => false);
  }

  public async login(account: string, password: string): Promise<boolean> {
    let token = await AccountModel.login(account, password);
    if (!token) return false;
    this.token$.next(token);
    const user = this._decodeToken(token);
    this.accountSubject$.next(user);
    return !!user;
  }

  public async logout() {
    this._clearToken();
    await AccountModel.logout();
  }

  private _clearToken() {
    this.token$.next('');
  }

  private async _loginByStorageToken() {
    await this._connectionService.awaitConnected();
    let token = window.localStorage.getItem(environment.loginTokenKey);
    if (!token) this.token$.next('');
    this.token$.next(token);
  }

  private _decodeToken(token: string): UserDto {
    if (!token) {
      return null;
    }

    try {
      return jwt.default(token);
    } catch (err) {
      this.token$.next(null);
      console.error('解碼存取權杖時發生錯誤', { token, err });
      return null;
    }
  }
}
