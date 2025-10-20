import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Broadcast {
  title: string;
  channel: string;
  audience: string;
  sendAt: string;
  status: 'sent' | 'scheduled' | 'draft';
  metrics: string;
}

@Component({
  selector: 'cs-marketing-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketing-messages.component.html',
  styleUrl: './marketing-messages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketingMessagesComponent {
  readonly broadcasts: Broadcast[] = [
    {
      title: '冬季北海道 12% 折扣推播',
      channel: 'App 推播',
      audience: '活躍會員 · 6,200 人',
      sendAt: '2024/12/01 10:00',
      status: 'sent',
      metrics: '開啟率 31% · 點擊率 9.4%'
    },
    {
      title: '黑鑽 VIP 禮遇簡訊',
      channel: 'SMS',
      audience: '黑鑽 VIP · 320 人',
      sendAt: '2024/12/08 19:00',
      status: 'scheduled',
      metrics: '預估轉換率 18%'
    },
    {
      title: '週末旅遊靈感電子報',
      channel: 'Email',
      audience: '所有訂閱者 · 48,000 人',
      sendAt: '草稿',
      status: 'draft',
      metrics: '草稿 · 預計 12/05 發送'
    }
  ];
}
