import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  login(payload: LoginPayload): Observable<LoginResponse> {
    const { email, password } = payload;
    const isValid = email === 'demo@trevia.app' && password === 'Password123';

    if (!isValid) {
      return throwError(() => new Error('帳號或密碼錯誤，請再試一次。')).pipe(delay(600));
    }

    return of({
      token: 'mock-token-1234567890',
      user: {
        id: 'user-1',
        name: 'Demo User',
        email
      }
    }).pipe(delay(600));
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
}
