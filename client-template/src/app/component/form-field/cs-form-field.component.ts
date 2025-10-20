import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'cs-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-form-field.component.html',
  styleUrl: './cs-form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsFormFieldComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string | null;
  @Input() required = false;
  @Input() disabled = false;
}
