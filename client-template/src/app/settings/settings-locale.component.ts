import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface LocaleOption {
  locale: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  default: boolean;
}

interface TranslationProgress {
  language: string;
  completion: string;
  pending: number;
}

@Component({
  selector: 'cs-settings-locale',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-locale.component.html',
  styleUrl: './settings-locale.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsLocaleComponent {
  readonly locales: LocaleOption[] = [
    {
      locale: '繁體中文 (zh-TW)',
      timezone: 'Asia/Taipei',
      currency: 'TWD',
      dateFormat: 'YYYY/MM/DD',
      default: true
    },
    {
      locale: 'English (en-US)',
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      default: false
    },
    {
      locale: '日本語 (ja-JP)',
      timezone: 'Asia/Tokyo',
      currency: 'JPY',
      dateFormat: 'YYYY年MM月DD日',
      default: false
    }
  ];

  readonly translations: TranslationProgress[] = [
    { language: '網站頁面', completion: '96%', pending: 12 },
    { language: 'Email 模板', completion: '88%', pending: 5 },
    { language: 'App 內文', completion: '72%', pending: 18 }
  ];
}
