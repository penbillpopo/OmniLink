import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Coupon {
  code: string;
  name: string;
  type: 'percentage' | 'amount';
  value: string;
  usage: string;
  status: 'active' | 'scheduled' | 'expired';
  validRange: string;
}

@Component({
  selector: 'cs-marketing-coupons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketing-coupons.component.html',
  styleUrl: './marketing-coupons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketingCouponsComponent {
  readonly coupons: Coupon[] = [
    {
      code: 'WINTER24',
      name: '冬季海外 88 折',
      type: 'percentage',
      value: '12% OFF',
      usage: '使用 1,024 / 3,000',
      status: 'active',
      validRange: '2024/11/20 - 2025/01/31'
    },
    {
      code: 'VIP1500',
      name: 'VIP 年終加碼',
      type: 'amount',
      value: '折 NT$1,500',
      usage: '使用 210 / 500',
      status: 'scheduled',
      validRange: '2024/12/15 - 2025/02/15'
    },
    {
      code: 'FLASH500',
      name: '限時快閃折抵',
      type: 'amount',
      value: '折 NT$500',
      usage: '使用 1,980 / 1,980',
      status: 'expired',
      validRange: '2024/10/10 - 2024/10/12'
    }
  ];
}
