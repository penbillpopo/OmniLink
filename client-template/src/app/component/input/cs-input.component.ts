import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Optional,
  Self
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

let nextId = 0;

@Component({
  selector: 'cs-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cs-input.component.html',
  styleUrl: './cs-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsInputComponent implements ControlValueAccessor {
  private readonly defaultId = `cs-input-${++nextId}`;

  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() autocomplete: string | null = null;
  @Input() inputmode?: string;
  @Input() supportingText?: string;
  @Input() errors: Record<string, string> = {};
  @Input() required = false;
  @Input() name?: string;
  @Input() id?: string;

  value = '';
  isDisabled = false;

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
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
