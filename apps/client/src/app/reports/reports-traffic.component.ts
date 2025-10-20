import { CommonModule, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface TrafficSource {
  source: string;
  sessions: number;
  share: number;
  conversion: number;
}

interface LandingPage {
  page: string;
  sessions: number;
  bounceRate: number;
  conversion: number;
}

@Component({
  selector: 'cs-reports-traffic',
  standalone: true,
  imports: [CommonModule, PercentPipe],
  templateUrl: './reports-traffic.component.html',
  styleUrl: './reports-traffic.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsTrafficComponent {
  readonly sources: TrafficSource[] = [
    { source: '自然搜尋', sessions: 82_400, share: 0.42, conversion: 0.038 },
    { source: '付費廣告', sessions: 54_210, share: 0.28, conversion: 0.051 },
    { source: '社群媒體', sessions: 26_840, share: 0.14, conversion: 0.027 },
    { source: '直接流量', sessions: 18_620, share: 0.09, conversion: 0.062 },
    { source: '電子報', sessions: 12_450, share: 0.07, conversion: 0.089 }
  ];

  readonly landingPages: LandingPage[] = [
    { page: '首頁', sessions: 45_120, bounceRate: 0.36, conversion: 0.052 },
    { page: '北海道雪季專題', sessions: 22_480, bounceRate: 0.21, conversion: 0.078 },
    { page: '會員專屬優惠', sessions: 18_260, bounceRate: 0.18, conversion: 0.092 },
    { page: '親子自由行推薦', sessions: 16_005, bounceRate: 0.24, conversion: 0.061 }
  ];
}
