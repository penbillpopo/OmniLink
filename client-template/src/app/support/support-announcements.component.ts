import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface SupportAnnouncement {
  title: string;
  channel: string;
  publishAt: string;
  content: string;
  status: 'active' | 'scheduled' | 'archived';
}

@Component({
  selector: 'cs-support-announcements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-announcements.component.html',
  styleUrl: './support-announcements.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportAnnouncementsComponent {
  readonly announcements: SupportAnnouncement[] = [
    {
      title: '客服中心 12/08 維護通知',
      channel: '官網 + App',
      publishAt: '2024/12/05 09:00',
      content: '12/08 02:00-04:00 系統維護，Live Chat 暫停服務，建議改用 Email 聯絡。',
      status: 'scheduled'
    },
    {
      title: '客服滿意度調查',
      channel: 'Email',
      publishAt: '2024/11/20 18:00',
      content: '邀請近期與客服互動的會員填寫問卷，預計抽出 20 名贈送電子禮券。',
      status: 'active'
    },
    {
      title: '客服中心搬遷公告',
      channel: '官網',
      publishAt: '2024/08/01 10:00',
      content: '客服中心已搬遷至內湖新辦公室，服務電話維持不變。',
      status: 'archived'
    }
  ];
}
