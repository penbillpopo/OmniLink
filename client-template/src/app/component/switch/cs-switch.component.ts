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

let nextId = 0;

@Component({
  selector: 'cs-switch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cs-switch.component.html',
  styleUrl: './cs-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsSwitchComponent implements ControlValueAccessor {
  private readonly defaultId = `cs-switch-${++nextId}`;

  @Input() label?: string;
  @Input() hint?: string;
  @Input() disabled = false;
  @Input() id?: string;
  @Input() name?: string;

  value = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private readonly cdr: ChangeDetectorRef,
    @Optional() @Self() readonly ngControl: NgControl | null
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get controlId(): string {
    return this.id ?? this.defaultId;
  }

  writeValue(value: boolean | null): void {
    this.value = !!value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleChange(checked: boolean): void {
    this.value = checked;
    this.onChange(checked);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
