import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface RevenueStream {
  source: string;
  amount: number;
  share: number;
  growth: number;
}

interface ExpenseRow {
  category: string;
  amount: number;
  share: number;
}

@Component({
  selector: 'cs-reports-revenue',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, PercentPipe],
  templateUrl: './reports-revenue.component.html',
  styleUrl: './reports-revenue.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsRevenueComponent {
  readonly revenueStreams: RevenueStream[] = [
    { source: '旅遊商品營收', amount: 38_500_000, share: 0.78, growth: 0.18 },
    { source: '加購服務', amount: 6_200_000, share: 0.13, growth: 0.24 },
    { source: '廣告與置入', amount: 1_850_000, share: 0.04, growth: 0.06 },
    { source: '會員訂閱', amount: 2_600_000, share: 0.05, growth: 0.11 }
  ];

  readonly expenses: ExpenseRow[] = [
    { category: '供應商成本', amount: 26_800_000, share: 0.55 },
    { category: '行銷費用', amount: 4_500_000, share: 0.18 },
    { category: '客服與人力', amount: 3_200_000, share: 0.13 },
    { category: '平台維運', amount: 2_100_000, share: 0.09 },
    { category: '其他', amount: 1_100_000, share: 0.05 }
  ];
}
