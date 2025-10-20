import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CsIconButtonComponent } from '../icon-button/cs-icon-button.component';

@Component({
  selector: 'cs-dialog',
  standalone: true,
  imports: [CommonModule, CsIconButtonComponent],
  templateUrl: './cs-dialog.component.html',
  styleUrl: './cs-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsDialogComponent {
  @Input() open = false;
  @Input() title?: string;
  @Input() closeOnBackdrop = true;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<'close' | 'backdrop'>();

  close(reason: 'close' | 'backdrop'): void {
    if (reason === 'backdrop' && !this.closeOnBackdrop) {
      return;
    }

    if (this.open) {
      this.open = false;
      this.openChange.emit(false);
      this.closed.emit(reason);
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
