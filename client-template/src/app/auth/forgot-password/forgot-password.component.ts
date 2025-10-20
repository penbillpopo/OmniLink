import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CsButtonComponent, CsFormComponent, CsInputComponent } from '../../component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'cs-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CsFormComponent, CsInputComponent, CsButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly hasSubmitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly message = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly emailErrors = {
    required: 'Email is required.',
    email: 'Enter a valid email address.'
  };

  ngOnInit(): void {
    const state = window.history.state as { email?: string } | undefined;
    if (state?.email) {
      this.form.patchValue({ email: state.email });
    }
  }

  submit(): void {
    this.hasSubmitted.set(true);
    this.message.set(null);
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const email = this.form.controls.email.value;

    this.auth
      .requestPasswordReset(email)
      .pipe(
        take(1),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: response => {
          this.message.set(response.message);
        },
        error: error => {
          this.errorMessage.set(error.message || '目前無法送出重設要求，請稍後再試。');
        }
      });
  }

  backToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
