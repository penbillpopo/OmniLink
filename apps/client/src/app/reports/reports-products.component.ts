import { CommonModule, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ProductMetric {
  title: string;
  value: string;
  hint: string;
}

interface ConversionRow {
  product: string;
  view: number;
  cart: number;
  conversion: number;
}

@Component({
  selector: 'cs-reports-products',
  standalone: true,
  imports: [CommonModule, PercentPipe],
  templateUrl: './reports-products.component.html',
  styleUrl: './reports-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsProductsComponent {
  readonly metrics: ProductMetric[] = [
    { title: '平均轉換率', value: '4.8%', hint: '近 30 天訪問至下單比率' },
    { title: '內容更新完成度', value: '92%', hint: '具備最新圖文與行程細節的商品占比' },
    { title: '加購比率', value: '36%', hint: '下單時同步加購保險或體驗的訂單占比' }
  ];

  readonly conversions: ConversionRow[] = [
    { product: '北海道雪季自由行 5 日', view: 18240, cart: 1_250, conversion: 0.082 },
    { product: '巴黎聖誕市集深度體驗 7 日', view: 14410, cart: 1_004, conversion: 0.069 },
    { product: '沖繩親子度假套票', view: 12890, cart: 982, conversion: 0.061 },
    { product: '瑞士冰河列車豪華行程 10 日', view: 8_200, cart: 430, conversion: 0.052 }
  ];
}
