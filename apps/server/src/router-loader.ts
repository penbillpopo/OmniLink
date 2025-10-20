// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { loadCommon } from './_common/router';
import { loadModule } from './_module/router';
import { loadAccount } from './account/router';
import { loadStatus } from './status/router';

export function loadModules() {
  loadCommon();
  loadModule();
  loadAccount();
  loadStatus();
}
// 9adafca8d5d290a499f44484921b215d0fbb78f4f40a3a948e6379bbcf3d169b
