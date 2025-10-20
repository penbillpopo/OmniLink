import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'cs-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-skeleton.component.html',
  styleUrl: './cs-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsSkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() radius: string = '12px';
}
