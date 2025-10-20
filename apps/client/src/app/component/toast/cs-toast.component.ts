import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface CsToast {
  id: string;
  title?: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
}

@Component({
  selector: 'cs-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-toast.component.html',
  styleUrl: './cs-toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsToastComponent {
  @Input() toasts: CsToast[] = [];

  @Output() dismissed = new EventEmitter<string>();

  trackToast(_index: number, toast: CsToast): string {
    return toast.id;
  }

  dismiss(id: string): void {
    this.dismissed.emit(id);
  }
}
