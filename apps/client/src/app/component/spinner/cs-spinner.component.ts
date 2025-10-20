import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'cs-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-spinner.component.html',
  styleUrl: './cs-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
