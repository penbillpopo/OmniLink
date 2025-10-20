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

export interface CsDropdownMenuItem {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'cs-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-dropdown-menu.component.html',
  styleUrl: './cs-dropdown-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsDropdownMenuComponent {
  @Input() triggerLabel = 'Menu';
  @Input() items: CsDropdownMenuItem[] = [];
  @Input() alignment: 'start' | 'end' = 'start';

  @Output() itemSelected = new EventEmitter<CsDropdownMenuItem>();

  open = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  toggle(): void {
    this.open = !this.open;
  }

  select(item: CsDropdownMenuItem): void {
    if (item.disabled) {
      return;
    }

    this.itemSelected.emit(item);
    this.open = false;
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

    this.open = false;
  }
}
