import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface InventoryRecord {
  sku: string;
  product: string;
  supplier: string;
  available: number;
  reserved: number;
  threshold: number;
  nextArrival: string;
}

interface RestockTask {
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  eta: string;
  owner: string;
}

@Component({
  selector: 'cs-inventory-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-management.component.html',
  styleUrl: './inventory-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryManagementComponent {
  readonly records: InventoryRecord[] = [
    {
      sku: 'TR-000185',
      product: '北海道雪季自由行 5 日',
      supplier: '北國旅行社',
      available: 32,
      reserved: 14,
      threshold: 20,
      nextArrival: '2024/12/10'
    },
    {
      sku: 'TR-000201',
      product: '沖繩親子度假套票',
      supplier: '旭日旅遊',
      available: 18,
      reserved: 9,
      threshold: 15,
      nextArrival: '2024/12/04'
    },
    {
      sku: 'TR-000112',
      product: '瑞士冰河列車豪華行程 10 日',
      supplier: '瑞航合作社',
      available: 6,
      reserved: 5,
      threshold: 8,
      nextArrival: '2025/01/05'
    },
    {
      sku: 'TR-000078',
      product: '台東熱氣球嘉年華 3 日',
      supplier: '台灣慢旅',
      available: 0,
      reserved: 0,
      threshold: 10,
      nextArrival: '2025/06/01'
    }
  ];

  readonly tasks: RestockTask[] = [
    {
      title: '確認北海道 1 月航班位置',
      status: 'in-progress',
      eta: '2024/12/03',
      owner: '供應鏈 - 徐湘婷'
    },
    {
      title: '洽談沖繩親子套票冬季加班機',
      status: 'pending',
      eta: '2024/12/08',
      owner: '採購 - 李政安'
    },
    {
      title: '瑞士冰河列車 2025 Q1 合約議價',
      status: 'pending',
      eta: '2024/12/20',
      owner: '策略合作 - 陳柏安'
    }
  ];
}
