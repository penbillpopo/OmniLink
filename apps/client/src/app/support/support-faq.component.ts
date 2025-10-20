import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface FaqItem {
  category: string;
  question: string;
  answer: string;
  updatedAt: string;
}

@Component({
  selector: 'cs-support-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-faq.component.html',
  styleUrl: './support-faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportFaqComponent {
  readonly faqs: FaqItem[] = [
    {
      category: '訂單與付款',
      question: '付款成功但未收到確認信？',
      answer: '請先檢查垃圾郵件，若 10 分鐘內仍未收到，可於「訂單列表」點選重寄或聯繫客服。',
      updatedAt: '2024/11/18'
    },
    {
      category: '旅遊文件',
      question: '如何上傳護照資料？',
      answer: '登入會員中心 > 訂單管理 > 點選「補件」，支援 JPG/PNG/PDF，檔案大小需小於 10MB。',
      updatedAt: '2024/10/22'
    },
    {
      category: '退款規則',
      question: '旅遊前幾天取消可以退款？',
      answer: '依照商品頁面公告的取消條款為主，若為不可退費商品，我們仍可協助改期或轉讓。',
      updatedAt: '2024/09/30'
    }
  ];
}
