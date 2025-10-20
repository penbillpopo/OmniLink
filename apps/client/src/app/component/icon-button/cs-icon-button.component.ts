import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'cs-icon-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-icon-button.component.html',
  styleUrl: './cs-icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsIconButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'ghost' | 'solid' | 'danger' = 'ghost';
  @Input() disabled = false;
  @Input() ariaLabel = '';
}
