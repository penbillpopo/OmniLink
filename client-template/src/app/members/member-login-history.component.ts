import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface LoginRecord {
  memberId: string;
  name: string;
  platform: string;
  device: string;
  location: string;
  ip: string;
  loginAt: string;
  status: 'success' | 'failed' | 'blocked';
}

@Component({
  selector: 'cs-member-login-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-login-history.component.html',
  styleUrl: './member-login-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberLoginHistoryComponent {
  readonly records: LoginRecord[] = [
    {
      memberId: 'MB20231001',
      name: '林嘉穎',
      platform: 'Web',
      device: 'Chrome / macOS 14',
      location: '台北市 信義區',
      ip: '123.201.85.18',
      loginAt: '2024/12/02 09:12',
      status: 'success'
    },
    {
      memberId: 'MB20204022',
      name: '王立群',
      platform: 'iOS App',
      device: 'iPhone 15 Pro',
      location: '新北市 板橋區',
      ip: '60.248.13.44',
      loginAt: '2024/12/02 08:57',
      status: 'failed'
    },
    {
      memberId: 'MB20221135',
      name: '陳信宏',
      platform: 'Android App',
      device: 'Pixel 8',
      location: '高雄市 左營區',
      ip: '118.166.240.101',
      loginAt: '2024/12/01 23:41',
      status: 'success'
    },
    {
      memberId: 'MB20191278',
      name: '吳佩琳',
      platform: 'Web',
      device: 'Edge / Windows 10',
      location: '台中市 西屯區',
      ip: '36.224.91.13',
      loginAt: '2024/11/30 17:03',
      status: 'blocked'
    },
    {
      memberId: 'MB20240112',
      name: '郭俊豪',
      platform: 'Web',
      device: 'Safari / macOS 14',
      location: '台南市 東區',
      ip: '111.249.63.18',
      loginAt: '2024/12/01 19:20',
      status: 'success'
    }
  ];
}
