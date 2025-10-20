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

export interface CsSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

let nextId = 0;

@Component({
  selector: 'cs-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CsFormFieldComponent],
  templateUrl: './cs-select.component.html',
  styleUrl: './cs-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsSelectComponent implements ControlValueAccessor {
  private readonly defaultId = `cs-select-${++nextId}`;

  @Input() label?: string;
  @Input() hint?: string;
  @Input() placeholder?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() options: CsSelectOption[] = [];
  @Input() id?: string;
  @Input() name?: string;
  @Input() errors: Record<string, string> = {};

  value: string | null = null;

  private onChange: (value: string | null) => void = () => {};
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

  writeValue(value: string | null): void {
    this.value = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleChange(value: string): void {
    const next = value === '' ? null : value;
    this.value = next;
    this.onChange(next);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
