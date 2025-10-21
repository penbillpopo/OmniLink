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
  selector: 'cs-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CsFormComponent,
    CsInputComponent,
    CsCheckboxComponent,
    CsButtonComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(32)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    agreeToTerms: [false, [Validators.requiredTrue]]
  });

  readonly hasSubmitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly nameErrors = {
    required: 'Name is required.',
    minlength: 'Name must be at least 2 characters.',
    maxlength: 'Name must be 32 characters or fewer.'
  };

  readonly emailErrors = {
    required: 'Email is required.',
    email: 'Enter a valid email address.'
  };

  readonly passwordErrors = {
    required: 'Password is required.',
    minlength: 'Password must be at least 8 characters.'
  };

  readonly confirmPasswordErrors = {
    required: 'Please confirm your password.',
    mismatch: 'Passwords must match.'
  };

  ngOnInit(): void {
    this.registerForm.controls.password.valueChanges.subscribe(() => {
      this.clearPasswordMismatch();
    });

    this.registerForm.controls.confirmPassword.valueChanges.subscribe(() => {
      this.clearPasswordMismatch();
    });
  }

  submit(): void {
    this.hasSubmitted.set(true);
    this.errorMessage.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.passwordsMatch()) {
      this.registerForm.controls.confirmPassword.setErrors({ mismatch: true });
      return;
    }

    this.isSubmitting.set(true);
    const { name, email, password } = this.registerForm.getRawValue();

    this.auth
      .register({
        name: name.trim(),
        email: email.trim(),
        password
      })
      .pipe(
        take(1),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: () => {
          this.storeRememberedEmail(email.trim());
          this.router.navigate(['/login'], {
            queryParams: { registered: '1' },
            state: { email: email.trim() }
          });
        },
        error: error => {
          this.errorMessage.set(error.message || 'Registration failed. Please try again.');
        }
      });
  }

  private passwordsMatch(): boolean {
    const { password, confirmPassword } = this.registerForm.getRawValue();
    return password === confirmPassword;
  }

  private clearPasswordMismatch(): void {
    const control = this.registerForm.controls.confirmPassword;
    const errors = control.errors;
    if (!errors || !errors['mismatch']) {
      return;
    }

    const { mismatch, ...rest } = errors;
    const hasOtherErrors = Object.keys(rest).length > 0;
    control.setErrors(hasOtherErrors ? rest : null);
  }

  private storeRememberedEmail(email: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('trevia-remembered-email', email);
  }
}
