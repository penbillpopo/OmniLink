import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'cs-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-empty-state.component.html',
  styleUrl: './cs-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsEmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() description = 'Try adjusting your filters or create a new item to get started.';
}
