// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { loadCommon } from './_common/router';
import { loadModule } from './_module/router';
import { loadAccount } from './account/router';
import { loadAudit } from './audit/router';
import { loadLoginLog } from './login-log/router';
import { loadRole } from './role/router';
import { loadStatus } from './status/router';

export function loadModules() {
  loadCommon();
  loadModule();
  loadAccount();
  loadAudit();
  loadLoginLog();
  loadRole();
  loadStatus();
}
// 8accec169b21016e8c3d55f7c780029b8ff19343f15bd913b3b089ffa3437c25
