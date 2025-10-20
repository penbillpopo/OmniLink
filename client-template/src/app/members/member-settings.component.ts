import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface PreferenceItem {
  label: string;
  description: string;
  enabled: boolean;
}

interface AutomationRule {
  name: string;
  trigger: string;
  action: string;
  appliedTo: string;
}

@Component({
  selector: 'cs-member-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-settings.component.html',
  styleUrl: './member-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberSettingsComponent {
  readonly preferences: PreferenceItem[] = [
    {
      label: 'Email 通知',
      description: '訂單成立、取消、行程提醒等系統訊息將發送 Email',
      enabled: true
    },
    {
      label: 'SMS 簡訊提醒',
      description: '重要行程或帳務通知將發送手機簡訊',
      enabled: false
    },
    {
      label: 'App 推播',
      description: '提供即時優惠與行程變動通知',
      enabled: true
    },
    {
      label: '月度會員報告',
      description: '每月寄送旅遊消費分析與專屬推薦',
      enabled: true
    }
  ];

  readonly automations: AutomationRule[] = [
    {
      name: '潛在流失會員提醒',
      trigger: '45 天未登入 + 未完成任務',
      action: '發送關懷 Email + 1000 積分挽留券',
      appliedTo: '黃金/白金會員'
    },
    {
      name: '升等資格推播',
      trigger: '距離升等僅剩 10% 門檻',
      action: 'App 推播升等任務 + 專屬旅程建議',
      appliedTo: '全體會員'
    },
    {
      name: '生日旅遊提案',
      trigger: '生日月前 30 天',
      action: 'Email 套票提案 + 客服跟進',
      appliedTo: '白金/黑鑽 VIP'
    }
  ];
}
