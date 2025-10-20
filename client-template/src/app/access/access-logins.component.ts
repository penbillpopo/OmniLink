import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface AdminLoginRecord {
  account: string;
  name: string;
  ip: string;
  location: string;
  time: string;
  status: 'success' | 'failed' | 'locked';
}

@Component({
  selector: 'cs-access-logins',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './access-logins.component.html',
  styleUrl: './access-logins.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessLoginsComponent {
  readonly loginRecords: AdminLoginRecord[] = [
    {
      account: 'bruce',
      name: 'Bruce Liu',
      ip: '123.201.85.18',
      location: '台北市',
      time: '2024/12/02 08:55',
      status: 'success'
    },
    {
      account: 'agnes.lin',
      name: 'Agnes Lin',
      ip: '118.166.240.101',
      location: '台南市',
      time: '2024/12/02 09:40',
      status: 'locked'
    },
    {
      account: 'steven',
      name: 'Steven Chen',
      ip: '211.23.88.42',
      location: '新北市',
      time: '2024/12/01 23:20',
      status: 'failed'
    },
    {
      account: 'amber.tsai',
      name: 'Amber Tsai',
      ip: '60.248.13.44',
      location: '台北市',
      time: '2024/12/01 22:15',
      status: 'success'
    }
  ];
}
