import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface SecurityPolicy {
  name: string;
  description: string;
  status: 'enabled' | 'disabled';
}

interface AuditItem {
  event: string;
  actor: string;
  time: string;
  detail: string;
}

@Component({
  selector: 'cs-settings-security',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-security.component.html',
  styleUrl: './settings-security.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSecurityComponent {
  readonly policies: SecurityPolicy[] = [
    {
      name: '強制兩步驗證',
      description: '所有後台帳號需啟用 OTP 驗證。',
      status: 'enabled'
    },
    {
      name: '密碼 90 天更新',
      description: '密碼需每 90 天更新，且不可重複前三次紀錄。',
      status: 'enabled'
    },
    {
      name: 'IP 白名單限制',
      description: '僅允許公司網域與 VPN 連線存取後台。',
      status: 'disabled'
    }
  ];

  readonly audits: AuditItem[] = [
    {
      event: '角色權限變更',
      actor: '系統管理員 - Bruce',
      time: '2024/12/02 12:30',
      detail: '調整客服角色可查看退款頁面'
    },
    {
      event: '多次失敗登入',
      actor: '帳號：finance-lin',
      time: '2024/12/01 22:18',
      detail: 'IP 118.166.240.101 · 已鎖定 30 分鐘'
    },
    {
      event: 'API Key 產生',
      actor: '開發人員 - Amber',
      time: '2024/11/29 09:12',
      detail: '建立供應商資料同步 key，有效期 90 天'
    }
  ];
}
