import { CommonModule, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface MemberSegment {
  segment: string;
  members: number;
  share: number;
  trend: number;
}

interface EngagementMetric {
  title: string;
  value: string;
  hint: string;
}

@Component({
  selector: 'cs-reports-members',
  standalone: true,
  imports: [CommonModule, PercentPipe],
  templateUrl: './reports-members.component.html',
  styleUrl: './reports-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsMembersComponent {
  readonly segments: MemberSegment[] = [
    { segment: '黑鑽 VIP', members: 320, share: 0.026, trend: 0.12 },
    { segment: '白金', members: 1_240, share: 0.099, trend: 0.08 },
    { segment: '黃金', members: 3_420, share: 0.274, trend: 0.05 },
    { segment: '銀卡', members: 7_500, share: 0.601, trend: -0.02 }
  ];

  readonly metrics: EngagementMetric[] = [
    { title: '活躍登入率', value: '66.6%', hint: '近 30 天內登入會員占比' },
    { title: '月度回購率', value: '24.3%', hint: '完成 2 次以上訂單的會員比例' },
    { title: '任務完成率', value: '48%', hint: '完成升等任務的會員比例' }
  ];
}
