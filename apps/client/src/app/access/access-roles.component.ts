import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Role {
  name: string;
  description: string;
  members: number;
  permissions: string[];
}

@Component({
  selector: 'cs-access-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './access-roles.component.html',
  styleUrl: './access-roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessRolesComponent {
  readonly roles: Role[] = [
    {
      name: '系統管理員',
      description: '擁有所有後台功能，負責維護系統設定與安全。',
      members: 4,
      permissions: ['帳號管理', '功能開關', '安全設定', '資料匯出']
    },
    {
      name: '客服專員',
      description: '處理會員諮詢、訂單調整與退款流程。',
      members: 12,
      permissions: ['會員查看', '訂單管理', '退款審核']
    },
    {
      name: '行銷人員',
      description: '管理優惠券、活動與推播訊息，分析成效報表。',
      members: 6,
      permissions: ['行銷活動', '推播通知', '報表瀏覽']
    }
  ];
}
