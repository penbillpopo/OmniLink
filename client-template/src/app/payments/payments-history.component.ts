import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface PaymentTransaction {
  paymentNo: string;
  orderNo: string;
  member: string;
  method: string;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  amount: number;
  paidAt: string;
  note?: string;
}

@Component({
  selector: 'cs-payments-history',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './payments-history.component.html',
  styleUrl: './payments-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsHistoryComponent {
  readonly transactions: PaymentTransaction[] = [
    {
      paymentNo: 'PM20241202035',
      orderNo: 'OD20241202001',
      member: '林嘉穎',
      method: '信用卡 (VISA)',
      status: 'success',
      amount: 46800,
      paidAt: '2024/12/02 09:16'
    },
    {
      paymentNo: 'PM20241130011',
      orderNo: 'OD20241130022',
      member: '張庭瑜',
      method: '信用卡分期',
      status: 'pending',
      amount: 32900,
      paidAt: '等待銀行確認',
      note: '需補上身分證影本'
    },
    {
      paymentNo: 'PM20241128008',
      orderNo: 'OD20241128005',
      member: '陳信宏',
      method: 'LINE Pay',
      status: 'success',
      amount: 75800,
      paidAt: '2024/11/28 19:12'
    },
    {
      paymentNo: 'PM20241116003',
      orderNo: 'OD20241115016',
      member: '吳佩琳',
      method: '銀行轉帳',
      status: 'refunded',
      amount: 12800,
      paidAt: '2024/11/16 11:08',
      note: '訂單取消，款項已退回'
    },
    {
      paymentNo: 'PM20241022044',
      orderNo: 'OD20241022088',
      member: '郭俊豪',
      method: '信用卡 (Mastercard)',
      status: 'failed',
      amount: 189000,
      paidAt: '2024/10/22 16:45',
      note: '銀行拒絕交易，需改用匯款'
    }
  ];
}
