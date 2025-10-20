import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled' | 'beta';
  rollout: string;
}

@Component({
  selector: 'cs-settings-feature-flags',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-feature-flags.component.html',
  styleUrl: './settings-feature-flags.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsFeatureFlagsComponent {
  readonly flags: FeatureFlag[] = [
    {
      key: 'new-dashboard',
      name: '全新儀表板體驗',
      description: '提供高階會員專屬的互動式 KPI 儀表板。',
      status: 'beta',
      rollout: 'VIP 會員 25%'
    },
    {
      key: 'instant-refund',
      name: '即時退款流程',
      description: '金流審核通過後 5 分鐘內退回款項。',
      status: 'enabled',
      rollout: '全會員'
    },
    {
      key: 'ai-itinerary',
      name: 'AI 智能行程推薦',
      description: '根據旅客偏好自動生成旅遊行程提案。',
      status: 'disabled',
      rollout: '預計 2025 Q1'
    }
  ];
}
