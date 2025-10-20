import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Preference {
  key: string;
  value: string;
  description: string;
}

@Component({
  selector: 'cs-settings-general',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-general.component.html',
  styleUrl: './settings-general.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsGeneralComponent {
  readonly companyInfo: Preference[] = [
    { key: '品牌名稱', value: 'Trevia 旅遊體驗', description: '顯示於前台 header 與 Email' },
    { key: '官方網址', value: 'https://www.trevia.com', description: '系統通知使用的連結' },
    { key: '客服信箱', value: 'support@trevia.com', description: '客服回覆與會員通知' },
    { key: '客服專線', value: '02-8899-7788', description: '前台顯示的服務電話' }
  ];

  readonly bookingSettings: Preference[] = [
    { key: '訂單編號格式', value: 'OD{YYYY}{MM}{SEQ4}', description: '可定義年度、月份與流水號' },
    { key: '訂金比例', value: '30%', description: '預設須支付訂金比例，可逐單調整' },
    { key: '自動取消時間', value: '48 小時', description: '未付款自動取消之時間' }
  ];
}
