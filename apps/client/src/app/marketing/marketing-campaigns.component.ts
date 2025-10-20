import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Campaign {
  name: string;
  channel: string;
  period: string;
  budget: string;
  result: string;
  status: 'ongoing' | 'upcoming' | 'ended';
}

@Component({
  selector: 'cs-marketing-campaigns',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketing-campaigns.component.html',
  styleUrl: './marketing-campaigns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketingCampaignsComponent {
  readonly campaigns: Campaign[] = [
    {
      name: '2024 冬季海外滑雪專案',
      channel: 'Facebook / IG / EDM',
      period: '2024/11/15 - 2025/01/15',
      budget: 'NT$ 1,200,000',
      result: 'ROI 4.2 · 訂單 812 筆',
      status: 'ongoing'
    },
    {
      name: '黑鑽 VIP 年終巡迴酒會',
      channel: 'Line OA / VIP 行銷',
      period: '2024/12/10 - 2024/12/24',
      budget: 'NT$ 450,000',
      result: '預估參與率 68%',
      status: 'upcoming'
    },
    {
      name: '秋季國旅振興方案',
      channel: 'Google Ads / 聯盟行銷',
      period: '2024/08/01 - 2024/10/31',
      budget: 'NT$ 980,000',
      result: 'ROI 3.6 · 訂單 1,204 筆',
      status: 'ended'
    }
  ];
}
