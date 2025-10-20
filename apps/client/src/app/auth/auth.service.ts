import { Injectable } from '@angular/core';
import { Observable, defer, filter, map, of, switchMap, take, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TokenService } from 'src/services/token.service';
import { UserDto } from '@ay-gosu/server-shared';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public constructor(private readonly _tokenService: TokenService) {}

  login(payload: LoginPayload): Observable<LoginResponse> {
    return defer(() =>
      this._tokenService
        .login(payload.email, payload.password)
        .then(success => ({ success }))
        .catch(() => ({ success: false }))
    ).pipe(
      switchMap(({ success }) => {
        if (!success) {
          return throwError(() => new Error('帳號或密碼錯誤，請再試一次。'));
        }

        return this._tokenService.account$.pipe(
          filter((account): account is UserDto => !!account),
          take(1),
          map(account => ({
            token: payload.email,
            user: {
              id: this._resolveAccountId(account) ?? payload.email,
              name: this._resolveAccountName(account) ?? payload.email,
              email: this._resolveAccountEmail(account) ?? payload.email
            }
          }))
        );
      })
    );
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return throwError(() => new Error('請輸入電子郵件。'));
    }

    const exists = normalizedEmail === 'demo@trevia.app';

    if (!exists) {
      return throwError(() => new Error('找不到這個帳號，請確認後再試一次。')).pipe(delay(600));
    }

    return of({
      message: '重設密碼連結已寄出，請檢查您的信箱。'
    }).pipe(delay(600));
  }

  private _resolveAccountId(account: UserDto): string | undefined {
    const candidate = (account as unknown as Record<string, unknown>) ?? {};
    const id =
      candidate['accountId'] ??
      candidate['userId'] ??
      candidate['id'] ??
      candidate['account_id'];
    return typeof id === 'string' ? id : typeof id === 'number' ? String(id) : undefined;
  }

  private _resolveAccountName(account: UserDto): string | undefined {
    const candidate = (account as unknown as Record<string, unknown>) ?? {};
    const name =
      candidate['accountName'] ??
      candidate['name'] ??
      candidate['username'] ??
      candidate['account'];
    return typeof name === 'string' ? name : undefined;
  }

  private _resolveAccountEmail(account: UserDto): string | undefined {
    const candidate = (account as unknown as Record<string, unknown>) ?? {};
    const email = candidate['email'] ?? candidate['mail'];
    return typeof email === 'string' ? email : undefined;
  }
}
