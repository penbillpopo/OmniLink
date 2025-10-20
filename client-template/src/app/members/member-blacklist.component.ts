import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface BlacklistRecord {
  id: string;
  name: string;
  email: string;
  reason: string;
  addedBy: string;
  addedAt: string;
  note: string;
  status: 'permanent' | 'temporary';
  releaseAt?: string;
}

@Component({
  selector: 'cs-member-blacklist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-blacklist.component.html',
  styleUrl: './member-blacklist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberBlacklistComponent {
  readonly records: BlacklistRecord[] = [
    {
      id: 'MB20191278',
      name: '吳佩琳',
      email: 'peilin.wu@example.com',
      reason: '疑似盜刷信用卡，客服確認未提供身分證明',
      addedBy: '客服主管 - 王郁真',
      addedAt: '2024/06/15 13:42',
      note: '提供多組不同信用卡且 IP 多次變動，建議列入黑名單',
      status: 'permanent'
    },
    {
      id: 'MB20202011',
      name: '蔡詠慈',
      email: 'yiung.tzai@example.com',
      reason: '多次惡意取消訂房並留下負評',
      addedBy: '客服人員 - 郭佳靜',
      addedAt: '2024/08/22 09:12',
      note: '提供 3 次補救方案仍拒絕且威脅負評，目前暫停 90 天',
      status: 'temporary',
      releaseAt: '2024/11/20'
    },
    {
      id: 'MB20230978',
      name: '林祐任',
      email: 'lin.you.jen@example.com',
      reason: '檢舉涉及旅伴詐騙，警政已介入調查',
      addedBy: '法務 - 曾巧心',
      addedAt: '2024/10/03 18:20',
      note: '合作警方調查中，待司法程序完成不可解除',
      status: 'permanent'
    }
  ];
}
