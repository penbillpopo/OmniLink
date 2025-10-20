import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ScheduleItem {
  title: string;
  channel: string;
  scheduledAt: string;
  owner: string;
  status: 'queued' | 'approved' | 'draft';
}

@Component({
  selector: 'cs-marketing-scheduler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketing-scheduler.component.html',
  styleUrl: './marketing-scheduler.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketingSchedulerComponent {
  readonly schedules: ScheduleItem[] = [
    {
      title: '冬季旅遊 EDM #2',
      channel: 'Email',
      scheduledAt: '2024/12/05 09:30',
      owner: '行銷 - 郭筱筠',
      status: 'approved'
    },
    {
      title: 'VIP 候補推播',
      channel: 'App 推播',
      scheduledAt: '2024/12/07 20:00',
      owner: 'CRM - 何信安',
      status: 'queued'
    },
    {
      title: '新年倒數社群貼文',
      channel: 'Facebook / IG',
      scheduledAt: '2024/12/31 21:00',
      owner: '社群 - 張品安',
      status: 'draft'
    }
  ];
}
