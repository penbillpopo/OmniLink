import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Webhook {
  name: string;
  event: string;
  url: string;
  secret: string;
  lastDelivery: string;
  status: 'active' | 'failed';
}

@Component({
  selector: 'cs-developer-webhooks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './developer-webhooks.component.html',
  styleUrl: './developer-webhooks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeveloperWebhooksComponent {
  readonly webhooks: Webhook[] = [
    {
      name: '訂單建立通知',
      event: 'order.created',
      url: 'https://partner.treviahub.com/webhook/order',
      secret: '•••••8f42',
      lastDelivery: '2024/12/02 09:18 · 成功',
      status: 'active'
    },
    {
      name: '退款完成通知',
      event: 'order.refunded',
      url: 'https://finance.treviahub.com/webhook/refund',
      secret: '•••••1acb',
      lastDelivery: '2024/12/01 21:44 · 成功',
      status: 'active'
    },
    {
      name: '庫存同步',
      event: 'inventory.updated',
      url: 'https://suppliersync.example.com/hook',
      secret: '•••••dd21',
      lastDelivery: '2024/11/29 18:05 · 失敗 (500)',
      status: 'failed'
    }
  ];
}
