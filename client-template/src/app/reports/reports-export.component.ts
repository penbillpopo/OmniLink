import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ExportTemplate {
  name: string;
  description: string;
  fields: string[];
  schedule: string;
}

@Component({
  selector: 'cs-reports-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-export.component.html',
  styleUrl: './reports-export.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsExportComponent {
  readonly templates: ExportTemplate[] = [
    {
      name: '月度營收報表',
      description: '含訂單金額、付款狀態與毛利率，提供財務部審核。',
      fields: ['訂單編號', '會員', '營收', '毛利率', '付款方式'],
      schedule: '每月 1 日 09:00 自動寄出'
    },
    {
      name: '會員成長分析',
      description: '追蹤會員註冊、登入、升等與流失狀況。',
      fields: ['會員編號', '等級', '最近登入', '升等日期', '狀態'],
      schedule: '每週一 09:30 寄送給 CRM 團隊'
    },
    {
      name: '行銷活動成效',
      description: '整合活動投放、點擊與訂單成效，支援 ROI 計算。',
      fields: ['活動名稱', '渠道', '花費', '轉換訂單', 'ROI'],
      schedule: '活動結束後 1 小時自動產出'
    }
  ];
}
