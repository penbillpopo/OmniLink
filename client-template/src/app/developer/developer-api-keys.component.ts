import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ApiKey {
  name: string;
  scope: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'disabled';
}

@Component({
  selector: 'cs-developer-api-keys',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './developer-api-keys.component.html',
  styleUrl: './developer-api-keys.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeveloperApiKeysComponent {
  readonly keys: ApiKey[] = [
    {
      name: '供應商同步',
      scope: 'products:read orders:read',
      createdAt: '2024/09/18',
      lastUsed: '2024/12/02 08:10',
      status: 'active'
    },
    {
      name: '合作夥伴報表',
      scope: 'reports:read',
      createdAt: '2024/10/05',
      lastUsed: '2024/11/30 19:44',
      status: 'active'
    },
    {
      name: '測試用 Key',
      scope: 'sandbox',
      createdAt: '2024/07/02',
      lastUsed: '2024/08/15 11:00',
      status: 'disabled'
    }
  ];
}
