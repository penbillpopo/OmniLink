import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  CsButtonComponent,
  CsCheckboxComponent,
  CsFormComponent,
  CsInputComponent
} from '../component';

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

  readonly registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    agreeToTerms: [false, [Validators.requiredTrue]]
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

    const { email } = this.registerForm.getRawValue();

    setTimeout(() => {
      this.isSubmitting.set(false);
      console.table(this.registerForm.getRawValue());
      this.router.navigateByUrl('/app/dashboard', { state: { email } });
    }, 800);
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
}
