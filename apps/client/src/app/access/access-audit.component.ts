import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface AuditLog {
  action: string;
  operator: string;
  module: string;
  time: string;
  detail: string;
}

@Component({
  selector: 'cs-access-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './access-audit.component.html',
  styleUrl: './access-audit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessAuditComponent {
  readonly logs: AuditLog[] = [
    {
      action: '更新會員等級權益',
      operator: 'CRM - 陳奕安',
      module: '會員中心',
      time: '2024/12/02 10:25',
      detail: '調整白金會員升等條件為消費 50,000'
    },
    {
      action: '匯出銷售報表',
      operator: '財務 - 王采蓁',
      module: '報表與分析',
      time: '2024/12/02 09:05',
      detail: '產出 2024/11 營收報表，下載 CSV'
    },
    {
      action: '新增黑名單',
      operator: '客服主管 - 郭佳靜',
      module: '會員中心',
      time: '2024/12/01 21:44',
      detail: '將會員 MB20202011 設定為暫停 90 天'
    },
    {
      action: '修改功能旗標',
      operator: '系統管理員 - Bruce',
      module: '系統管理',
      time: '2024/11/30 18:12',
      detail: '啟用即時退款流程'
    }
  ];
}
