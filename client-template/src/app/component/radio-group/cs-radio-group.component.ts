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

export interface CsRadioOption {
  label: string;
  value: string;
  hint?: string;
  disabled?: boolean;
}

@Component({
  selector: 'cs-radio-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cs-radio-group.component.html',
  styleUrl: './cs-radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsRadioGroupComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';
  @Input() name?: string;
  @Input() disabled = false;
  @Input() options: CsRadioOption[] = [];

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

  handleChange(option: CsRadioOption): void {
    if (this.disabled || option.disabled) {
      return;
    }

    this.value = option.value;
    this.onChange(option.value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
