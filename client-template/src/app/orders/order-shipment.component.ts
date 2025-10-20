import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ShipmentRow {
  shipmentNo: string;
  orderNo: string;
  member: string;
  deliverable: string;
  carrier: string;
  trackingNo: string;
  status: 'preparing' | 'shipped' | 'delivered';
  shippedAt: string;
}

@Component({
  selector: 'cs-order-shipment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-shipment.component.html',
  styleUrl: './order-shipment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderShipmentComponent {
  readonly shipments: ShipmentRow[] = [
    {
      shipmentNo: 'SH20241202008',
      orderNo: 'OD20241202001',
      member: '林嘉穎',
      deliverable: '旅遊憑證 + 行前手冊',
      carrier: 'Email / App',
      trackingNo: '—',
      status: 'delivered',
      shippedAt: '2024/12/02 09:20'
    },
    {
      shipmentNo: 'SH20241130002',
      orderNo: 'OD20241130022',
      member: '張庭瑜',
      deliverable: '護照影本收取快遞',
      carrier: '黑貓宅急便',
      trackingNo: '900123456789',
      status: 'shipped',
      shippedAt: '2024/12/01 11:32'
    },
    {
      shipmentNo: 'SH20241128004',
      orderNo: 'OD20241128005',
      member: '陳信宏',
      deliverable: '行程套票 + 禮券',
      carrier: '順豐速運',
      trackingNo: 'SF12399881124',
      status: 'preparing',
      shippedAt: '預計 2024/12/04'
    }
  ];
}
