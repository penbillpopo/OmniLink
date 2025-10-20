import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList
} from '@angular/core';
import { CsTabComponent } from './cs-tab.component';

@Component({
  selector: 'cs-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-tabs.component.html',
  styleUrl: './cs-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsTabsComponent implements AfterContentInit {
  @ContentChildren(CsTabComponent) tabs!: QueryList<CsTabComponent>;

  @Input() activeIndex = 0;
  @Input() fitted = false;

  @Output() activeIndexChange = new EventEmitter<number>();

  ngAfterContentInit(): void {
    if (this.activeIndex < 0 || this.activeIndex >= this.tabs.length) {
      this.activeIndex = 0;
    }
  }

  selectTab(index: number): void {
    const tab = this.tabs.get(index);
    if (!tab || tab.disabled || this.activeIndex === index) {
      return;
    }

    this.activeIndex = index;
    this.activeIndexChange.emit(index);
  }
}
