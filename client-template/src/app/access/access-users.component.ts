import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface AdminUser {
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'locked';
}

@Component({
  selector: 'cs-access-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './access-users.component.html',
  styleUrl: './access-users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessUsersComponent {
  readonly admins: AdminUser[] = [
    {
      name: 'Bruce Liu',
      email: 'bruce@trevia.com',
      role: '系統管理員',
      lastLogin: '2024/12/02 08:55',
      status: 'active'
    },
    {
      name: 'Amber Tsai',
      email: 'amber.tsai@trevia.com',
      role: '開發管理員',
      lastLogin: '2024/12/01 23:10',
      status: 'active'
    },
    {
      name: 'Steven Chen',
      email: 'steven@trevia.com',
      role: '客服主管',
      lastLogin: '2024/11/29 19:24',
      status: 'inactive'
    },
    {
      name: 'Agnes Lin',
      email: 'agnes.lin@trevia.com',
      role: '財務管理員',
      lastLogin: '2024/12/02 09:42',
      status: 'locked'
    }
  ];
}
