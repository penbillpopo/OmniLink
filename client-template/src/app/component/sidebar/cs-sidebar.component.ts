import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { RouterLink } from '@angular/router';

export interface CsSidebarItem {
  label: string;
  route?: string;
  externalUrl?: string;
  icon?: string;
  children?: CsSidebarItem[];
  collapsed?: boolean;
}

export interface CsSidebarSection {
  label: string;
  items: CsSidebarItem[];
}

@Component({
  selector: 'cs-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cs-sidebar.component.html',
  styleUrl: './cs-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsSidebarComponent implements OnChanges, OnInit {
  @Input() brand: string | null = 'Trevia';
  @Input() sections: CsSidebarSection[] = [
    {
      label: '系統管理',
      items: [
        {
          label: '登出',
          route: '/logout'
        }
      ]
    }
  ];

  @Output() itemSelected = new EventEmitter<CsSidebarItem>();

  private expandedGroups = new Set<string>();

  ngOnInit(): void {
    if (!this.expandedGroups.size) {
      this.initializeExpandedGroups();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sections']) {
      this.initializeExpandedGroups();
    }
  }

  isGroupExpanded(sectionIndex: number, itemIndex: number, item: CsSidebarItem): boolean {
    return this.expandedGroups.has(this.getGroupKey(sectionIndex, itemIndex, item));
  }

  toggleGroup(sectionIndex: number, itemIndex: number, item: CsSidebarItem): void {
    const key = this.getGroupKey(sectionIndex, itemIndex, item);

    if (this.expandedGroups.has(key)) {
      this.expandedGroups.delete(key);
    } else {
      this.expandedGroups.add(key);
    }
  }

  handleClick(event: Event, item: CsSidebarItem): void {
    if (!item.route && !item.externalUrl) {
      event.preventDefault();
    }

    this.itemSelected.emit(item);
  }

  private initializeExpandedGroups(): void {
    this.expandedGroups = new Set<string>();

    this.sections.forEach((section, sectionIndex) =>
      section.items.forEach((item, itemIndex) => {
        if (item.children?.length && !item.collapsed) {
          this.expandedGroups.add(this.getGroupKey(sectionIndex, itemIndex, item));
        }
      })
    );
  }

  private getGroupKey(sectionIndex: number, itemIndex: number, item: CsSidebarItem): string {
    const identifier = item.route ?? item.label ?? `${sectionIndex}-${itemIndex}`;
    return `${sectionIndex}-${itemIndex}-${identifier}`;
  }
}
