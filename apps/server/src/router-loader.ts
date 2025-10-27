// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { loadCommon } from './_common/router';
import { loadModule } from './_module/router';
import { loadAccount } from './account/router';
import { loadAudit } from './audit/router';
import { loadLoginLog } from './login-log/router';
import { loadPage } from './page/router';
import { loadPageComponent } from './page-component/router';
import { loadPublic } from './public/router';
import { loadRole } from './role/router';
import { loadStatus } from './status/router';

export function loadModules() {
  loadCommon();
  loadModule();
  loadAccount();
  loadAudit();
  loadLoginLog();
  loadPage();
  loadPageComponent();
  loadPublic();
  loadRole();
  loadStatus();
}
// a30b75c341924fe95d56956b10f53e0aa3f5a2a824c2441ffc18eea6efefc9ad
