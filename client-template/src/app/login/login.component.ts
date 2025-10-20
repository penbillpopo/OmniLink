import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  CsButtonComponent,
  CsCheckboxComponent,
  CsFormComponent,
  CsInputComponent
} from '../component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'cs-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsFormComponent,
    CsInputComponent,
    CsButtonComponent,
    CsCheckboxComponent,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [true]
  });

  readonly hasSubmitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly emailErrors = {
    required: 'Email is required.',
    email: 'Enter a valid email address.'
  };
  readonly passwordErrors = {
    required: 'Password is required.',
    minlength: 'Password must be at least 8 characters.'
  };

  ngOnInit(): void {
    const rememberedEmail = this.getRememberedEmail();
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  submit(): void {
    this.hasSubmitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const { email, password, rememberMe } = this.loginForm.getRawValue();

    this.auth
      .login({ email, password })
      .pipe(
        take(1),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: () => {
          if (rememberMe) {
            this.setRememberedEmail(email);
          } else {
            this.clearRememberedEmail();
          }

          this.router.navigateByUrl('/app/dashboard');
        },
        error: error => {
          this.errorMessage.set(error.message || 'Unable to log in right now. Please try again.');
        }
      });
  }

  goToForgotPassword(): void {
    const email = this.loginForm.controls.email.value;
    this.router.navigate(['/forgot-password'], {
      state: { email }
    });
  }

  private getRememberedEmail(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem('trevia-remembered-email');
  }

  private setRememberedEmail(email: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('trevia-remembered-email', email);
  }

  private clearRememberedEmail(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem('trevia-remembered-email');
  }
}
