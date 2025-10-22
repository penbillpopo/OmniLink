// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { loadCommon } from './_common/router';
import { loadModule } from './_module/router';
import { loadAccount } from './account/router';
import { loadAudit } from './audit/router';
import { loadLoginLog } from './login-log/router';
import { loadPage } from './page/router';
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
  loadPublic();
  loadRole();
  loadStatus();
}
// 7310673a679c82c9e09bd186202517f38b197256329d6eb102092a1c0b6ec9b3
