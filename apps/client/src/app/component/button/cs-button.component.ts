import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'cs-button',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './cs-button.component.html',
  styleUrl: './cs-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'outline' | 'ghost' | 'danger' | 'text' = 'primary';
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() loading = false;

  get hostClasses(): Record<string, boolean> {
    return {
      'cs-button--primary': this.variant === 'primary',
      'cs-button--outline': this.variant === 'outline',
      'cs-button--ghost': this.variant === 'ghost',
      'cs-button--danger': this.variant === 'danger',
      'cs-button--text': this.variant === 'text',
      'cs-button--full': this.fullWidth,
      'cs-button--loading': this.loading
    };
  }
}
