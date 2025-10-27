import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  CsSidebarComponent,
  CsSidebarItem,
  CsSidebarSection,
} from '../component';
import { TokenService } from 'src/services/token.service';
import { PageDataService } from '../page/page-data.service';
import { PageDto } from '@ay-gosu/server-shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cs-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CsSidebarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit, OnDestroy {
  public sections: CsSidebarSection[] = this._buildSections([]);

  private readonly _pageSubscription: Subscription;

  public constructor(
    private readonly _tokenService: TokenService,
    private readonly _router: Router,
    private readonly _pageDataService: PageDataService,
    private readonly _cdr: ChangeDetectorRef,
  ) {
    this._pageSubscription = this._pageDataService.pages$.subscribe((pages) => {
      this.sections = this._buildSections(pages);
      this._cdr.markForCheck();
    });
  }

  public async ngOnInit(): Promise<void> {
    if (!this._pageDataService.getCachedPages().length) {
      try {
        await this._pageDataService.refreshPages();
      } catch (error) {
        console.error('Failed to load pages for sidebar', error);
      }
    }
  }

  public ngOnDestroy(): void {
    this._pageSubscription.unsubscribe();
  }

  public onSidebarItemSelected(item: CsSidebarItem): void {
    if (item.action === 'logout') {
      this._tokenService
        .logout()
        .then(() => this._router.navigateByUrl('/form/login'))
        .catch((error) => console.error('Logout failed', error));
    }
  }

  private _buildSections(pages: PageDto[]): CsSidebarSection[] {
    const items: CsSidebarItem[] = [
      {
        label: '系統總覽',
        disabled: true,
        icon: 'fa-chart-simple',
        route: '/app/dashboard',
      },
      {
        label: '會員中心',
        icon: 'fa-users',
        disabled: true,
        children: [
          { label: '會員列表', route: '/app/members' },
          { label: '會員等級 / 標籤', route: '/app/members/tiers' },
          { label: '黑名單管理', route: '/app/members/blacklist' },
          { label: '登入紀錄', route: '/app/members/login-history' },
          { label: '會員設定', route: '/app/members/settings' },
        ],
      },
      {
        label: '商品與內容',
        icon: 'fa-box-open',
        disabled: true,
        children: [
          { label: '商品管理', route: '/app/products/list' },
          { label: '新增商品', route: '/app/products/new' },
          { label: '分類管理', route: '/app/catalog/categories' },
          { label: '屬性管理', route: '/app/catalog/attributes' },
          { label: '庫存管理', route: '/app/inventory' },
          { label: '內容管理', route: '/app/content/articles' },
          { label: '公告管理', route: '/app/content/announcements' },
        ],
      },
      {
        label: '訂單與交易',
        icon: 'fa-receipt',
        disabled: true,
        children: [
          { label: '訂單列表', route: '/app/orders' },
          { label: '交易紀錄', route: '/app/payments' },
          { label: '退款管理', route: '/app/orders/refunds' },
          { label: '出貨與物流', route: '/app/orders/shipment' },
          { label: '發票紀錄', route: '/app/orders/invoices' },
        ],
      },
      {
        label: '行銷推廣',
        icon: 'fa-bullhorn',
        disabled: true,
        children: [
          { label: '優惠券管理', route: '/app/marketing/coupons' },
          { label: '活動管理', route: '/app/marketing/campaigns' },
          { label: '推播與通知', route: '/app/marketing/messages' },
          { label: 'A/B 測試', route: '/app/marketing/abtest' },
          { label: '行銷排程', route: '/app/marketing/scheduler' },
        ],
      },
      {
        label: '報表與分析',
        icon: 'fa-chart-line',
        disabled: true,
        children: [
          { label: '銷售報表', route: '/app/reports/sales' },
          { label: '會員報表', route: '/app/reports/members' },
          { label: '商品報表', route: '/app/reports/products' },
          { label: '收入報表', route: '/app/reports/revenue' },
          { label: '流量來源分析', route: '/app/reports/traffic' },
          { label: '匯出管理', route: '/app/reports/export' },
        ],
      },
      {
        label: '系統管理',
        icon: 'fa-gear',
        disabled: true,
        children: [
          { label: '基本設定', route: '/app/settings/general' },
          { label: '多語與時區', route: '/app/settings/locale' },
          { label: '郵件與通知模板', route: '/app/settings/templates' },
          { label: '功能開關', route: '/app/settings/feature-flags' },
          { label: '安全與憑證', route: '/app/settings/security' },
        ],
      },
      this._buildPageSection(pages),
      {
        label: '權限與日誌',
        icon: 'fa-shield',
        children: [
          { label: '角色與權限', route: '/app/access/roles' },
          { label: '管理員帳號', route: '/app/access/users' },
          { label: '操作日誌', route: '/app/access/audit' },
          { label: '登入紀錄', route: '/app/access/logins' },
        ],
      },
      {
        label: '開發者中心',
        icon: 'fa-code',
        disabled: true,
        children: [
          { label: 'API Key 管理', route: '/app/developer/api-keys' },
          { label: 'Webhook 管理', route: '/app/developer/webhooks' },
          { label: '外部整合', route: '/app/developer/integrations' },
          { label: '錯誤日誌', route: '/app/developer/logs' },
        ],
      },
      {
        label: '通知與客服',
        icon: 'fa-headset',
        disabled: true,
        children: [
          { label: '客服工單', route: '/app/support/tickets' },
          { label: '聊天室', route: '/app/support/chat' },
          { label: 'FAQ', route: '/app/support/faq' },
          { label: '系統公告', route: '/app/support/announcements' },
        ],
      },
      {
        label: '登出',
        icon: 'fa-right-from-bracket',
        action: 'logout',
      },
    ];

    return [
      {
        label: '',
        items,
      },
    ];
  }

  private _buildPageSection(pages: PageDto[]): CsSidebarItem {
    return {
      label: '頁面專區',
      icon: 'fa-layer-group',
      children: [
        { label: '頁面架構', route: '/app/pages/structure' },
        { label: '頁面組件', route: '/app/pages/components' },
        ...pages.map((page) => ({
          label: page.name,
          route: `/app/pages/${page.id}`,
        })),
      ],
    };
  }
}
