import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface MemberTier {
  name: string;
  requirement: string;
  benefits: string[];
  perks: string[];
  renewal: string;
}

@Component({
  selector: 'cs-member-tiers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-tiers.component.html',
  styleUrl: './member-tiers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberTiersComponent {
  readonly tiers: MemberTier[] = [
    {
      name: '黑鑽 VIP',
      requirement: '年度累積消費 ≥ NT$100,000 或 推薦 5 位白金會員',
      benefits: ['專屬 1 對 1 客服管家', '所有訂單 12% 折扣', '不限次數免費升等房型'],
      perks: ['每季 1 次海外專屬活動邀請', '生日雙倍積分與豪華禮'],
      renewal: '需維持年度消費門檻，或每年推薦 3 位新會員'
    },
    {
      name: '白金',
      requirement: '年度累積消費 ≥ NT$50,000 或 積分 ≥ 20,000',
      benefits: ['訂單 8% 折扣', '免費機場接送 2 次 / 年', '客製行程規劃顧問'],
      perks: ['生日當月升等房型 1 次', '年度感謝禮盒'],
      renewal: '年度維持 40,000 消費或 15,000 積分'
    },
    {
      name: '黃金',
      requirement: '年度累積消費 ≥ NT$15,000 或 積分 ≥ 8,000',
      benefits: ['訂單 5% 折扣', '熱門行程優先預約', '國旅飯店延遲退房'],
      perks: ['生日加贈 2,000 積分', '專屬優惠電子報'],
      renewal: '年度維持 10,000 消費或 5,000 積分'
    },
    {
      name: '銀卡',
      requirement: '註冊即享，完成首次消費或認證手機即可升級',
      benefits: ['訂單 2% 積分回饋', '免費旅遊保險升級', '會員專屬優惠碼'],
      perks: ['生日加贈 500 積分', '客服優先等待權'],
      renewal: '無需門檻，維持有效登入即可'
    }
  ];
}
