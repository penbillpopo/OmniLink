import { Injectable } from '@angular/core';
import {
  LoginLogDto,
  LoginLogFilterDto,
  LoginLogModel,
  ResponseListDto,
  SearchDto,
} from '@ay-gosu/server-shared';

export type LoginLogStatus = 'success' | 'failed' | 'locked';

type LoginLogListOptions = {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: LoginLogStatus | '';
  accountId?: number;
  from?: string | Date | null;
  to?: string | Date | null;
};

type LoginLogListResult = {
  data: LoginLogDto[];
  total: number;
};

@Injectable({ providedIn: 'root' })
export class LoginLogDataService {
  private readonly _defaultPageSize = 20;
  private readonly _maxPageSize = 200;

  public async getLoginLogs(
    options: LoginLogListOptions = {},
  ): Promise<LoginLogListResult> {
    const pageSize = Math.max(
      1,
      Math.min(options.pageSize ?? this._defaultPageSize, this._maxPageSize),
    );
    const pageIndex = Math.max(1, options.pageIndex ?? 1);

    const searchDto: SearchDto = Object.assign(new SearchDto(), {
      pageIndex,
      pageSize,
      orderBy: 'DESC' as const,
      orderByColumn: 'createdAt',
      search: this._normalizeSearch(options.search),
    });

    const filter = this._buildFilter(options);

    const response = (await LoginLogModel.getLoginLogList(
      searchDto,
      filter,
    )) as ResponseListDto<LoginLogDto[]>;

    const data = (response?.data ?? []).map((item) => this._toLoginLog(item));

    return {
      data,
      total: response?.total ?? data.length,
    };
  }

  public async getRecentLoginLogs(
    limit = 5,
    filter?: Partial<LoginLogFilterDto>,
  ): Promise<LoginLogDto[]> {
    const normalizedFilter = this._normalizeFilter(filter);
    const safeLimit = Math.max(1, Math.min(limit ?? 5, 20));
    const response = await LoginLogModel.getRecentLoginLogs(
      safeLimit,
      normalizedFilter,
    );

    return (response ?? []).map((item) => this._toLoginLog(item));
  }

  private _buildFilter(
    options: LoginLogListOptions,
  ): LoginLogFilterDto | undefined {
    const filter: Partial<LoginLogFilterDto> = {};

    if (options.status && options.status.trim().length) {
      filter.status = this._normalizeStatus(options.status);
    }

    if (
      options.accountId !== undefined &&
      options.accountId !== null &&
      !Number.isNaN(Number(options.accountId))
    ) {
      filter.accountId = Number(options.accountId);
    }

    const from = this._normalizeDate(options.from, 'start');
    const to = this._normalizeDate(options.to, 'end');
    if (from) {
      filter.from = from;
    }
    if (to) {
      filter.to = to;
    }

    return this._normalizeFilter(filter);
  }

  private _normalizeFilter(
    filter?: Partial<LoginLogFilterDto>,
  ): LoginLogFilterDto | undefined {
    if (!filter) {
      return undefined;
    }

    const normalized = new LoginLogFilterDto();

    if (filter.status) {
      normalized.status = this._normalizeStatus(filter.status);
    }

    if (filter.accountId !== undefined && filter.accountId !== null) {
      normalized.accountId = filter.accountId;
    }

    if (filter.account) {
      normalized.account = filter.account;
    }

    if (filter.from) {
      normalized.from = filter.from;
    }

    if (filter.to) {
      normalized.to = filter.to;
    }

    return normalized;
  }

  private _toLoginLog(value: LoginLogDto): LoginLogDto {
    const dto =
      value instanceof LoginLogDto ? value : new LoginLogDto(value ?? {});

    const createdAt = this._toDate(dto.createdAt);
    if (createdAt) {
      dto.createdAt = createdAt;
    }

    const updatedAt = this._toDate(dto.updatedAt);
    if (updatedAt) {
      dto.updatedAt = updatedAt;
    }

    dto.status = this._normalizeStatus(dto.status);

    return dto;
  }

  private _normalizeStatus(status?: string | null): LoginLogStatus {
    switch (status) {
      case 'success':
      case 'locked':
        return status;

      case 'failed':
      default:
        return 'failed';
    }
  }

  private _normalizeSearch(search?: string | null): string | undefined {
    if (!search) {
      return undefined;
    }

    const trimmed = search.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private _normalizeDate(
    value?: string | Date | null,
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

  private _toDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }

    const date = new Date(value as any);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
