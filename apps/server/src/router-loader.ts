// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { loadCommon } from './_common/router';
import { loadModule } from './_module/router';
import { loadAccount } from './account/router';
import { loadAudit } from './audit/router';
import { loadRole } from './role/router';
import { loadStatus } from './status/router';

export function loadModules() {
  loadCommon();
  loadModule();
  loadAccount();
  loadAudit();
  loadRole();
  loadStatus();
}
// 8e338c312b3ea670f6a9eecc5f1db0c611a7da7b5b23539de5a0b58d226893e1
