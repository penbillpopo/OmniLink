import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Optional,
  Self
} from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { CsFormFieldComponent } from '../form-field/cs-form-field.component';

let nextId = 0;

@Component({
  selector: 'cs-number-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CsFormFieldComponent],
  templateUrl: './cs-number-input.component.html',
  styleUrl: './cs-number-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsNumberInputComponent implements ControlValueAccessor {
  private readonly defaultId = `cs-number-input-${++nextId}`;

  @Input() label?: string;
  @Input() hint?: string;
  @Input() placeholder?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step = 1;
  @Input() errors: Record<string, string> = {};
  @Input() id?: string;
  @Input() name?: string;

  value: number | null = null;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private readonly cdr: ChangeDetectorRef,
    @Optional() @Self() readonly ngControl: NgControl | null
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get control() {
    return this.ngControl?.control ?? null;
  }

  get controlId(): string {
    return this.id ?? this.defaultId;
  }

  get showError(): boolean {
    const control = this.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get errorMessage(): string | null {
    const control = this.control;
    if (!control || !this.showError || !control.errors) {
      return null;
    }

    for (const [errorKey, message] of Object.entries(this.errors)) {
      if (control.hasError(errorKey)) {
        return message;
      }
    }

    return null;
  }

  writeValue(value: number | null): void {
    this.value = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleInput(raw: string): void {
    const parsed = raw === '' ? null : Number(raw);
    this.value = Number.isFinite(parsed as number) ? (parsed as number) : null;
    this.onChange(this.value);
  }

  increment(): void {
    if (this.disabled) {
      return;
    }

    const next = (this.value ?? 0) + this.step;
    if (typeof this.max === 'number' && next > this.max) {
      this.setValue(this.max);
      return;
    }

    this.setValue(next);
  }

  decrement(): void {
    if (this.disabled) {
      return;
    }

    const next = (this.value ?? 0) - this.step;
    if (typeof this.min === 'number' && next < this.min) {
      this.setValue(this.min);
      return;
    }

    this.setValue(next);
  }

  handleBlur(): void {
    this.onTouched();
  }

  private setValue(value: number): void {
    this.value = value;
    this.onChange(value);
    this.cdr.markForCheck();
  }
}
