import { Share } from '@ay-nestjs/share-server';
import { Controller } from '@nestjs/common';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { LoginLogFilterDto } from './dto/login-log-filter.dto';
import { LoginLogDto } from './dto/login-log.dto';
import { LoginLogService } from './login-log.service';

@Controller('login-log')
export class LoginLogController {
  public constructor(private readonly _loginLogService: LoginLogService) {}

  @Share()
  public async getLoginLogList(
    searchDto: SearchDto,
    filter?: LoginLogFilterDto,
  ): Promise<ResponseListDto<LoginLogDto[]>> {
    return this._loginLogService.getLoginLogs(searchDto, filter);
  }

  @Share()
  public async getRecentLoginLogs(
    limit?: number,
    filter?: LoginLogFilterDto,
  ): Promise<LoginLogDto[]> {
    return this._loginLogService.getRecent(limit, filter);
  }
}
