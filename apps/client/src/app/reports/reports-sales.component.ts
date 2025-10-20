import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface SalesSummary {
  channel: string;
  orders: number;
  amount: number;
  growth: number;
}

interface TopProduct {
  name: string;
  amount: number;
  share: number;
}

@Component({
  selector: 'cs-reports-sales',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, PercentPipe],
  templateUrl: './reports-sales.component.html',
  styleUrl: './reports-sales.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsSalesComponent {
  readonly summaries: SalesSummary[] = [
    { channel: '官網', orders: 1820, amount: 23800000, growth: 0.18 },
    { channel: 'App', orders: 960, amount: 11250000, growth: 0.26 },
    { channel: '客服中心', orders: 342, amount: 6850000, growth: 0.04 },
    { channel: '合作夥伴', orders: 128, amount: 2950000, growth: -0.07 }
  ];

  readonly topProducts: TopProduct[] = [
    { name: '北海道雪季自由行 5 日', amount: 2680000, share: 0.12 },
    { name: '巴黎聖誕市集深度體驗 7 日', amount: 1980000, share: 0.09 },
    { name: '沖繩親子度假套票', amount: 1530000, share: 0.07 },
    { name: '瑞士冰河列車豪華行程 10 日', amount: 1890000, share: 0.09 }
  ];
}
