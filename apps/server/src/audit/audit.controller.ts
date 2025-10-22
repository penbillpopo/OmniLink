import { Share, Session } from '@ay-nestjs/share-server';
import { Controller } from '@nestjs/common';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { SessionDto } from '../_module/session.dto';
import { AuditService } from './audit.service';
import { AuditLogDto } from './dto/audit-log.dto';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Controller('audit')
export class AuditController {
  public constructor(private readonly _auditService: AuditService) {}

  @Share()
  public async getRecentAuditLogs(
    limit?: number,
    filter?: AuditLogFilterDto,
  ): Promise<AuditLogDto[]> {
    return this._auditService.getRecent(limit, filter);
  }

  @Share()
  public async getAuditList(
    searchDto: SearchDto,
    filter?: AuditLogFilterDto,
  ): Promise<ResponseListDto<AuditLogDto[]>> {
    return this._auditService.getAuditList(searchDto, filter);
  }

  @Share()
  public async createAuditLog(
    @Session() session: SessionDto,
    payload: CreateAuditLogDto,
  ): Promise<AuditLogDto> {
    return this._auditService.createAuditLog(payload, session);
  }
}
