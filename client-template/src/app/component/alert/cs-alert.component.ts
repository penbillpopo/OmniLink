import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'cs-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-alert.component.html',
  styleUrl: './cs-alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsAlertComponent {
  @Input() variant: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() title?: string;
}
