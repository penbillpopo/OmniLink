import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Integration {
  name: string;
  category: string;
  status: 'connected' | 'pending' | 'disconnected';
  owner: string;
  updatedAt: string;
  description: string;
}

@Component({
  selector: 'cs-developer-integrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './developer-integrations.component.html',
  styleUrl: './developer-integrations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeveloperIntegrationsComponent {
  readonly integrations: Integration[] = [
    {
      name: 'Amadeus GDS',
      category: '航班供應',
      status: 'connected',
      owner: '策略合作 - 王彥鈞',
      updatedAt: '2024/11/28 14:10',
      description: '同步國際航班與票價，提供最新座位與艙等資訊。'
    },
    {
      name: 'Stripe',
      category: '金流',
      status: 'connected',
      owner: '財務 - 林安琪',
      updatedAt: '2024/12/01 09:45',
      description: '提供信用卡與電子支付收款，含風險控管。'
    },
    {
      name: 'LINE 官方帳號',
      category: '行銷',
      status: 'pending',
      owner: '行銷 - 郭筱筠',
      updatedAt: '2024/12/02 11:05',
      description: '串接會員通知與聊天機器人，待審核 API 權限。'
    },
    {
      name: 'Salesforce CRM',
      category: '客戶關係',
      status: 'disconnected',
      owner: 'CRM - 陳奕安',
      updatedAt: '2024/11/15 18:20',
      description: '原外部 CRM 已停用，改採內部系統。'
    }
  ];
}
