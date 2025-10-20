import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ProductSummary {
  title: string;
  value: string;
  hint: string;
}

interface ProductRow {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'published' | 'draft' | 'archived';
  conversion: number;
  updatedAt: string;
}

@Component({
  selector: 'cs-product-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, PercentPipe],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  readonly stats: ProductSummary[] = [
    { title: '上架商品', value: '368', hint: '新上架：32 個' },
    { title: '平均轉換率', value: '4.8%', hint: '訂單成立率相較上月 +0.6%' },
    { title: '缺貨商品', value: '12', hint: '建議補貨以免流失訂單' },
    { title: '內容待更新', value: '23', hint: '需補上最新活動與照片' }
  ];

  readonly products: ProductRow[] = [
    {
      sku: 'TR-000185',
      name: '北海道雪季自由行 5 日',
      category: '海外旅遊 / 自由行',
      price: 46800,
      stock: 32,
      status: 'published',
      conversion: 0.082,
      updatedAt: '2024/12/01 21:30'
    },
    {
      sku: 'TR-000201',
      name: '沖繩親子度假套票',
      category: '親子首選',
      price: 32900,
      stock: 18,
      status: 'published',
      conversion: 0.061,
      updatedAt: '2024/11/29 14:22'
    },
    {
      sku: 'TR-000112',
      name: '瑞士冰河列車豪華行程 10 日',
      category: '高端旅遊',
      price: 189000,
      stock: 6,
      status: 'draft',
      conversion: 0.0,
      updatedAt: '2024/12/02 09:45'
    },
    {
      sku: 'TR-000078',
      name: '台東熱氣球嘉年華 3 日',
      category: '國旅 / 節慶',
      price: 12800,
      stock: 0,
      status: 'archived',
      conversion: 0.092,
      updatedAt: '2024/10/01 10:05'
    },
    {
      sku: 'TR-000244',
      name: '巴黎聖誕市集深度體驗 7 日',
      category: '城市深度',
      price: 75800,
      stock: 14,
      status: 'published',
      conversion: 0.048,
      updatedAt: '2024/11/30 18:12'
    }
  ];
}
