// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { wsc } from '../wsc';
import { LoginLogFilterDto } from './dto/login-log-filter.dto';
import { LoginLogDto } from './dto/login-log.dto';

export class LoginLogModel {
  static getLoginLogList(
    searchDto: SearchDto,
    filter?: LoginLogFilterDto,
  ): Promise<ResponseListDto<LoginLogDto[]>> {
    return wsc.execute(
      '/ws/login-log/getLoginLogList',
      searchDto,
      filter,
    ) as any;
  }

  static getRecentLoginLogs(
    limit?: number,
    filter?: LoginLogFilterDto,
  ): Promise<LoginLogDto[]> {
    return wsc.execute(
      '/ws/login-log/getRecentLoginLogs',
      limit,
      filter,
    ) as any;
  }
}
// c1101f14154884ec0c0f9f44c8b6ee1adf80d5963be18b267e331ac3fd0ea784
