import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Announcement {
  title: string;
  target: string;
  publishedAt: string;
  status: 'active' | 'scheduled' | 'expired';
  message: string;
}

@Component({
  selector: 'cs-content-announcements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-announcements.component.html',
  styleUrl: './content-announcements.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentAnnouncementsComponent {
  readonly announcements: Announcement[] = [
    {
      title: '系統維護公告',
      target: '全體會員',
      publishedAt: '2024/12/05 22:00',
      status: 'scheduled',
      message: '12/08 02:00-04:00 進行例行維護，期間將暫停訂單服務。'
    },
    {
      title: '黑鑽 VIP 年終禮遇',
      target: '黑鑽 VIP',
      publishedAt: '2024/11/30 10:00',
      status: 'active',
      message: '12 月預訂任一海外行程即享 12% 折扣與升等管家服務。'
    },
    {
      title: '客服服務升級通知',
      target: '全體會員',
      publishedAt: '2024/09/01 09:00',
      status: 'expired',
      message: '客服中心延長服務時間至每日 09:00-23:00，提供 Live Chat。'
    }
  ];
}
