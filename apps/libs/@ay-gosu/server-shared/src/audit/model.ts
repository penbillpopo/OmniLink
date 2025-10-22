// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { wsc } from '../wsc';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { AuditLogDto } from './dto/audit-log.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

export class AuditModel {
  static getRecentAuditLogs(
    limit?: number,
    filter?: AuditLogFilterDto,
  ): Promise<AuditLogDto[]> {
    return wsc.execute('/ws/audit/getRecentAuditLogs', limit, filter) as any;
  }

  static getAuditList(
    searchDto: SearchDto,
    filter?: AuditLogFilterDto,
  ): Promise<ResponseListDto<AuditLogDto[]>> {
    return wsc.execute('/ws/audit/getAuditList', searchDto, filter) as any;
  }

  static createAuditLog(payload: CreateAuditLogDto): Promise<AuditLogDto> {
    return wsc.execute('/ws/audit/createAuditLog', payload) as any;
  }
}
// 023389e453f5aa19490e1d3692ffe92b95a3e41418363c39df16695fc085da5a
