import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'cs-tab',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-template #content><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsTabComponent {
  @Input() label!: string;
  @Input() badge?: string;
  @Input() disabled = false;

  @ViewChild('content', { static: true }) content!: TemplateRef<unknown>;
}
