// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { loadCommon } from './_common/router';
import { loadModule } from './_module/router';
import { loadAccount } from './account/router';
import { loadRole } from './role/router';
import { loadStatus } from './status/router';

export function loadModules() {
  loadCommon();
  loadModule();
  loadAccount();
  loadRole();
  loadStatus();
}
// 1dbc073bef02e46c2cf2d898e2b14a15acfa2ac1a2eb8a9e2f82fac1f117d882
