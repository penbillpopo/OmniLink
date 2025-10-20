import { CommonModule, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface AbTest {
  name: string;
  target: string;
  metric: string;
  variantA: string;
  variantB: string;
  resultA: number;
  resultB: number;
  status: 'running' | 'planned' | 'completed';
}

@Component({
  selector: 'cs-marketing-abtest',
  standalone: true,
  imports: [CommonModule, PercentPipe],
  templateUrl: './marketing-abtest.component.html',
  styleUrl: './marketing-abtest.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketingAbtestComponent {
  readonly tests: AbTest[] = [
    {
      name: '首頁 Banner CTA',
      target: '訪客',
      metric: '點擊率',
      variantA: '立即預訂',
      variantB: '查看行程',
      resultA: 0.084,
      resultB: 0.067,
      status: 'running'
    },
    {
      name: 'Email 標題 - 冬季推薦',
      target: '會員',
      metric: '開啟率',
      variantA: '冬季旅遊 12% OFF',
      variantB: '北海道滑雪機票 8 折',
      resultA: 0.312,
      resultB: 0.284,
      status: 'completed'
    },
    {
      name: 'APP 推播文案',
      target: '活躍會員',
      metric: '點擊率',
      variantA: '推薦你專屬旅程',
      variantB: '3 天限時優惠',
      resultA: 0.094,
      resultB: 0.118,
      status: 'planned'
    }
  ];
}
