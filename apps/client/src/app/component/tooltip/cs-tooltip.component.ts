import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input
} from '@angular/core';

@Component({
  selector: 'cs-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-tooltip.component.html',
  styleUrl: './cs-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsTooltipComponent {
  @Input() message = '';
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'top';

  visible = false;

  @HostListener('mouseenter')
  @HostListener('focusin')
  show(): void {
    this.visible = true;
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  hide(): void {
    this.visible = false;
  }
}
