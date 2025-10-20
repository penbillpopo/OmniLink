import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CsButtonComponent } from '../button/cs-button.component';
import { CsDialogComponent } from '../dialog/cs-dialog.component';

@Component({
  selector: 'cs-confirm-dialog',
  standalone: true,
  imports: [CommonModule, CsDialogComponent, CsButtonComponent],
  templateUrl: './cs-confirm-dialog.component.html',
  styleUrl: './cs-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Are you sure?';
  @Input() message = '';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  handleClose(): void {
    this.setOpen(false);
    this.cancelled.emit();
  }

  handleConfirm(): void {
    this.setOpen(false);
    this.confirmed.emit();
  }

  handleOpenChange(value: boolean): void {
    if (!value) {
      this.handleClose();
    } else {
      this.setOpen(true);
    }
  }

  private setOpen(value: boolean): void {
    if (this.open !== value) {
      this.open = value;
      this.openChange.emit(value);
    }
  }
}
