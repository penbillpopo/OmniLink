import { Injectable } from '@angular/core';
import {
  AuditLogDto,
  AuditLogFilterDto,
  AuditModel,
  ResponseListDto,
  SearchDto,
} from '@ay-gosu/server-shared';

type AuditListOptions = {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  orderBy?: 'ASC' | 'DESC';
  orderByColumn?: string;
  filter?: Partial<AuditLogFilterDto>;
};

type AuditListResult = {
  data: AuditLogDto[];
  total: number;
};

@Injectable({ providedIn: 'root' })
export class AuditDataService {
  private readonly _defaultPageSize = 20;
  private readonly _maxExportPages = 10;
  private readonly _maxPageSize = 200;

  public async getRecent(
    options: {
      limit?: number;
      filter?: Partial<AuditLogFilterDto>;
    } = {},
  ): Promise<AuditLogDto[]> {
    const limit = Math.max(1, Math.min(options.limit ?? 10, 100));
    const filter = this._normalizeFilter(options.filter);
    const response = await AuditModel.getRecentAuditLogs(limit, filter);
    return (response ?? []).map((item) => this._toAuditLog(item));
  }

  public async getAuditList(
    options: AuditListOptions = {},
  ): Promise<AuditListResult> {
    const pageSize = Math.max(
      1,
      Math.min(options.pageSize ?? this._defaultPageSize, this._maxPageSize),
    );
    const pageIndex = Math.max(1, options.pageIndex ?? 1);

    const searchDto: SearchDto = Object.assign(new SearchDto(), {
      pageIndex,
      pageSize,
      orderBy: options.orderBy ?? 'DESC',
      orderByColumn: options.orderByColumn ?? 'createdAt',
      search: options.search?.trim() || undefined,
    });

    const filter = this._normalizeFilter(options.filter);
    const response = (await AuditModel.getAuditList(
      searchDto,
      filter,
    )) as ResponseListDto<AuditLogDto[]>;

    const data = (response?.data ?? []).map((item) =>
      this._toAuditLog(item),
    );

    return {
      data,
      total: response?.total ?? data.length,
    };
  }

  public async exportAuditLogs(
    options: AuditListOptions = {},
  ): Promise<AuditLogDto[]> {
    const pageSize = Math.max(
      1,
      Math.min(options.pageSize ?? this._maxPageSize, this._maxPageSize),
    );
    let pageIndex = Math.max(1, options.pageIndex ?? 1);

    const logs: AuditLogDto[] = [];
    let total = Number.POSITIVE_INFINITY;
    let pagesFetched = 0;

    while (logs.length < total) {
      const { data, total: currentTotal } = await this.getAuditList({
        ...options,
        pageIndex,
        pageSize,
      });

      total = currentTotal;
      logs.push(...data);

      pagesFetched++;
      if (data.length < pageSize || pagesFetched >= this._maxExportPages) {
        break;
      }

      pageIndex++;
    }

    return logs;
  }

  private _normalizeFilter(
    filter?: Partial<AuditLogFilterDto>,
  ): AuditLogFilterDto | undefined {
    if (!filter) {
      return undefined;
    }

    const normalized = new AuditLogFilterDto();

    if (filter.module) {
      normalized.module = filter.module;
    }

    if (filter.category) {
      normalized.category = filter.category;
    }

    if (
      filter.accountId !== undefined &&
      filter.accountId !== null &&
      !Number.isNaN(Number(filter.accountId))
    ) {
      normalized.accountId = Number(filter.accountId);
    }

    const from = this._normalizeDate(filter.from, 'start');
    if (from) {
      normalized.from = from;
    }

    const to = this._normalizeDate(filter.to, 'end');
    if (to) {
      normalized.to = to;
    }

    return normalized;
  }

  private _normalizeDate(
    value?: string | Date,
    mode: 'start' | 'end' = 'start',
  ): string | undefined {
    if (!value) {
      return undefined;
    }

    const date =
      value instanceof Date ? new Date(value.getTime()) : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    if (mode === 'start') {
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(23, 59, 59, 999);
    }

    return date.toISOString();
  }

  private _toAuditLog(value: AuditLogDto): AuditLogDto {
    const dto =
      value instanceof AuditLogDto ? value : new AuditLogDto(value ?? {});

    const createdAt = this._toDate(dto.createdAt);
    if (createdAt) {
      dto.createdAt = createdAt;
    }

    const updatedAt = this._toDate(dto.updatedAt);
    if (updatedAt) {
      dto.updatedAt = updatedAt;
    }

    return dto;
  }

  private _toDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }

    const date = new Date(value as any);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
