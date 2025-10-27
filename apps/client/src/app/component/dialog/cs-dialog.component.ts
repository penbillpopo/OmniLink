import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CsIconButtonComponent } from '../icon-button/cs-icon-button.component';

@Component({
  selector: 'cs-dialog',
  standalone: true,
  imports: [CommonModule, CsIconButtonComponent],
  templateUrl: './cs-dialog.component.html',
  styleUrl: './cs-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsDialogComponent {
  @Input() open = false;
  @Input() title?: string;
  @Input() closeOnBackdrop = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<'close' | 'backdrop'>();

  get panelClasses(): Record<string, boolean> {
    return {
      'cs-dialog__panel--sm': this.size === 'sm',
      'cs-dialog__panel--md': this.size === 'md',
      'cs-dialog__panel--lg': this.size === 'lg',
    };
  }

  public close(reason: 'close' | 'backdrop'): void {
    if (reason === 'backdrop' && !this.closeOnBackdrop) {
      return;
    }

    if (this.open) {
      this.open = false;
      this.openChange.emit(false);
      this.closed.emit(reason);
    }
  }

  @HostListener('keydown.escape', ['$event'])
  public handleEscape(event: KeyboardEvent): void {
    event.stopPropagation();
    this.close('close');
  }

  public stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
