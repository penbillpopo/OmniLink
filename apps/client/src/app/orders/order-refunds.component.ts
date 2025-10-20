import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface RefundRow {
  refundNo: string;
  orderNo: string;
  member: string;
  reason: string;
  status: 'processing' | 'approved' | 'rejected';
  amount: number;
  requestedAt: string;
  handledBy: string;
}

@Component({
  selector: 'cs-order-refunds',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './order-refunds.component.html',
  styleUrl: './order-refunds.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderRefundsComponent {
  readonly refunds: RefundRow[] = [
    {
      refundNo: 'RF20241201003',
      orderNo: 'OD20241130022',
      member: '張庭瑜',
      reason: '小孩發燒，無法出國',
      status: 'processing',
      amount: 32900,
      requestedAt: '2024/12/01 08:32',
      handledBy: '客服 - 李沛蓉'
    },
    {
      refundNo: 'RF20241118002',
      orderNo: 'OD20241115016',
      member: '吳佩琳',
      reason: '行程被取消',
      status: 'approved',
      amount: 12800,
      requestedAt: '2024/11/18 09:20',
      handledBy: '客服 - 王郁真'
    },
    {
      refundNo: 'RF20241025005',
      orderNo: 'OD20241022088',
      member: '郭俊豪',
      reason: '信用卡拒付，改匯款',
      status: 'rejected',
      amount: 189000,
      requestedAt: '2024/10/25 11:42',
      handledBy: '金流 - 胡曉芸'
    }
  ];
}
