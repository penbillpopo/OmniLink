import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface OrderRow {
  orderNo: string;
  member: string;
  itinerary: string;
  departDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'processing';
  createdAt: string;
}

@Component({
  selector: 'cs-orders-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersListComponent {
  readonly orders: OrderRow[] = [
    {
      orderNo: 'OD20241202001',
      member: '林嘉穎 / MB20231001',
      itinerary: '北海道雪季自由行 5 日',
      departDate: '2025/01/20',
      amount: 46800,
      status: 'paid',
      createdAt: '2024/12/02 09:15'
    },
    {
      orderNo: 'OD20241130022',
      member: '張庭瑜 / MB20230642',
      itinerary: '沖繩親子度假套票',
      departDate: '2024/12/28',
      amount: 32900,
      status: 'processing',
      createdAt: '2024/11/30 14:32'
    },
    {
      orderNo: 'OD20241128005',
      member: '陳信宏 / MB20221135',
      itinerary: '巴黎聖誕市集深度體驗 7 日',
      departDate: '2024/12/18',
      amount: 75800,
      status: 'paid',
      createdAt: '2024/11/28 19:10'
    },
    {
      orderNo: 'OD20241115016',
      member: '吳佩琳 / MB20191278',
      itinerary: '台東熱氣球嘉年華 3 日',
      departDate: '2025/07/12',
      amount: 12800,
      status: 'cancelled',
      createdAt: '2024/11/15 10:05'
    },
    {
      orderNo: 'OD20241022088',
      member: '郭俊豪 / MB20240112',
      itinerary: '瑞士冰河列車豪華行程 10 日',
      departDate: '2025/02/08',
      amount: 189000,
      status: 'pending',
      createdAt: '2024/10/22 16:42'
    }
  ];
}
