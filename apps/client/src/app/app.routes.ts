import { Routes } from '@angular/router';
import { AccessAuditComponent } from './access/access-audit.component';
import { AccessLoginsComponent } from './access/access-logins.component';
import { AccessRolesComponent } from './access/access-roles.component';
import { AccessUsersComponent } from './access/access-users.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { CatalogAttributesComponent } from './catalog/catalog-attributes.component';
import { CatalogCategoriesComponent } from './catalog/catalog-categories.component';
import { ContentAnnouncementsComponent } from './content/content-announcements.component';
import { ContentArticlesComponent } from './content/content-articles.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeveloperApiKeysComponent } from './developer/developer-api-keys.component';
import { DeveloperIntegrationsComponent } from './developer/developer-integrations.component';
import { DeveloperLogsComponent } from './developer/developer-logs.component';
import { DeveloperWebhooksComponent } from './developer/developer-webhooks.component';
import { InventoryManagementComponent } from './inventory/inventory-management.component';
import { ShellComponent } from './layout/shell.component';
import { TermsPrivacyComponent } from './legal/terms-privacy.component';
import { LoginComponent } from './login/login.component';
import { MarketingAbtestComponent } from './marketing/marketing-abtest.component';
import { MarketingCampaignsComponent } from './marketing/marketing-campaigns.component';
import { MarketingCouponsComponent } from './marketing/marketing-coupons.component';
import { MarketingMessagesComponent } from './marketing/marketing-messages.component';
import { MarketingSchedulerComponent } from './marketing/marketing-scheduler.component';
import { MemberBlacklistComponent } from './members/member-blacklist.component';
import { MemberLoginHistoryComponent } from './members/member-login-history.component';
import { MemberSettingsComponent } from './members/member-settings.component';
import { MemberTiersComponent } from './members/member-tiers.component';
import { MembersListComponent } from './members/members-list.component';
import { OrdersListComponent } from './orders/orders-list.component';
import { OrderInvoicesComponent } from './orders/order-invoices.component';
import { OrderRefundsComponent } from './orders/order-refunds.component';
import { OrderShipmentComponent } from './orders/order-shipment.component';
import { PaymentsHistoryComponent } from './payments/payments-history.component';
import { ProductCreateComponent } from './products/product-create.component';
import { ProductListComponent } from './products/product-list.component';
import { RegisterComponent } from './register/register.component';
import { ReportsExportComponent } from './reports/reports-export.component';
import { ReportsMembersComponent } from './reports/reports-members.component';
import { ReportsProductsComponent } from './reports/reports-products.component';
import { ReportsRevenueComponent } from './reports/reports-revenue.component';
import { ReportsSalesComponent } from './reports/reports-sales.component';
import { ReportsTrafficComponent } from './reports/reports-traffic.component';
import { SettingsFeatureFlagsComponent } from './settings/settings-feature-flags.component';
import { SettingsGeneralComponent } from './settings/settings-general.component';
import { SettingsLocaleComponent } from './settings/settings-locale.component';
import { SettingsSecurityComponent } from './settings/settings-security.component';
import { SettingsTemplatesComponent } from './settings/settings-templates.component';
import { SupportAnnouncementsComponent } from './support/support-announcements.component';
import { SupportChatComponent } from './support/support-chat.component';
import { SupportFaqComponent } from './support/support-faq.component';
import { SupportTicketsComponent } from './support/support-tickets.component';
import { VerifyToken } from './guard/verify-token';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'app/dashboard' },
  { path: 'login', redirectTo: 'form/login', pathMatch: 'full' },
  { path: 'form/login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'form/register', redirectTo: 'register', pathMatch: 'full' },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'terms', component: TermsPrivacyComponent },
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [VerifyToken],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'members', component: MembersListComponent },
      { path: 'members/tiers', component: MemberTiersComponent },
      { path: 'members/blacklist', component: MemberBlacklistComponent },
      { path: 'members/login-history', component: MemberLoginHistoryComponent },
      { path: 'members/settings', component: MemberSettingsComponent },
      { path: 'products/list', component: ProductListComponent },
      { path: 'products/new', component: ProductCreateComponent },
      { path: 'catalog/categories', component: CatalogCategoriesComponent },
      { path: 'catalog/attributes', component: CatalogAttributesComponent },
      { path: 'inventory', component: InventoryManagementComponent },
      { path: 'content/articles', component: ContentArticlesComponent },
      {
        path: 'content/announcements',
        component: ContentAnnouncementsComponent,
      },
      { path: 'orders', component: OrdersListComponent },
      { path: 'payments', component: PaymentsHistoryComponent },
      { path: 'orders/refunds', component: OrderRefundsComponent },
      { path: 'orders/shipment', component: OrderShipmentComponent },
      { path: 'orders/invoices', component: OrderInvoicesComponent },
      { path: 'marketing/coupons', component: MarketingCouponsComponent },
      { path: 'marketing/campaigns', component: MarketingCampaignsComponent },
      { path: 'marketing/messages', component: MarketingMessagesComponent },
      { path: 'marketing/abtest', component: MarketingAbtestComponent },
      { path: 'marketing/scheduler', component: MarketingSchedulerComponent },
      { path: 'reports/sales', component: ReportsSalesComponent },
      { path: 'reports/members', component: ReportsMembersComponent },
      { path: 'reports/products', component: ReportsProductsComponent },
      { path: 'reports/revenue', component: ReportsRevenueComponent },
      { path: 'reports/traffic', component: ReportsTrafficComponent },
      { path: 'reports/export', component: ReportsExportComponent },
      { path: 'settings/general', component: SettingsGeneralComponent },
      { path: 'settings/locale', component: SettingsLocaleComponent },
      { path: 'settings/templates', component: SettingsTemplatesComponent },
      {
        path: 'settings/feature-flags',
        component: SettingsFeatureFlagsComponent,
      },
      { path: 'settings/security', component: SettingsSecurityComponent },
      { path: 'access/roles', component: AccessRolesComponent },
      { path: 'access/users', component: AccessUsersComponent },
      { path: 'access/audit', component: AccessAuditComponent },
      { path: 'access/logins', component: AccessLoginsComponent },
      { path: 'developer/api-keys', component: DeveloperApiKeysComponent },
      { path: 'developer/webhooks', component: DeveloperWebhooksComponent },
      {
        path: 'developer/integrations',
        component: DeveloperIntegrationsComponent,
      },
      { path: 'developer/logs', component: DeveloperLogsComponent },
      { path: 'support/tickets', component: SupportTicketsComponent },
      { path: 'support/chat', component: SupportChatComponent },
      { path: 'support/faq', component: SupportFaqComponent },
      {
        path: 'support/announcements',
        component: SupportAnnouncementsComponent,
      },
    ],
  },
  { path: '**', redirectTo: 'app/dashboard' },
];
