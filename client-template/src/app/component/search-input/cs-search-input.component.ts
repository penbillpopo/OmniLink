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
  selector: 'cs-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CsFormFieldComponent],
  templateUrl: './cs-search-input.component.html',
  styleUrl: './cs-search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsSearchInputComponent implements ControlValueAccessor {
  private readonly defaultId = `cs-search-input-${++nextId}`;

  @Input() placeholder?: string;
  @Input() label?: string;
  @Input() hint?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() autocomplete: string | null = 'off';
  @Input() errors: Record<string, string> = {};
  @Input() name?: string;
  @Input() id?: string;

  value = '';

  private onChange: (value: string) => void = () => {};
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
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleInput(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  handleBlur(): void {
    this.onTouched();
  }

  clear(): void {
    if (this.disabled) {
      return;
    }

    this.handleInput('');
  }
}
