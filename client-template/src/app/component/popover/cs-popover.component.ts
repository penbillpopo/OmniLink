import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'cs-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-popover.component.html',
  styleUrl: './cs-popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsPopoverComponent {
  @Input() title?: string;
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Input() open = false;

  @Output() openChange = new EventEmitter<boolean>();

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  toggle(): void {
    this.setOpen(!this.open);
  }

  close(): void {
    this.setOpen(false);
  }

  private setOpen(value: boolean): void {
    if (this.open === value) {
      return;
    }

    this.open = value;
    this.openChange.emit(value);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event): void {
    if (!this.open) {
      return;
    }

    const target = event.target as Node | null;
    if (target && this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.close();
  }
}
