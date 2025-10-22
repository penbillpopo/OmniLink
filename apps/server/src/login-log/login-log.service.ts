import { Account, LoginLog } from '@ay-gosu/sequelize-models';
import { Injectable } from '@nestjs/common';
import { Includeable, Op, WhereOptions } from 'sequelize';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { SessionDto } from '../_module/session.dto';
import { LoginLogFilterDto } from './dto/login-log-filter.dto';
import { LoginLogDto } from './dto/login-log.dto';

type LoginLogStatus = 'success' | 'failed' | 'locked';

type RecordLoginOptions = {
  accountId?: number | null;
  account?: string | null;
  name?: string | null;
  status: LoginLogStatus | string;
  ipAddress?: string | null;
  location?: string | null;
  userAgent?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
};

@Injectable()
export class LoginLogService {
  public async record(
    options: RecordLoginOptions,
    session?: SessionDto,
  ): Promise<LoginLogDto> {
    const status = this._normalizeStatus(String(options.status ?? 'success'));
    const resolvedAccount = await this._resolveAccount(
      options.accountId,
      options.account,
    );

    const record = await LoginLog.create({
      accountId: resolvedAccount?.id ?? options.accountId ?? null,
      accountAccountSnapshot:
        options.account ?? resolvedAccount?.account ?? null,
      accountNameSnapshot: options.name ?? resolvedAccount?.name ?? null,
      status: status,
      ipAddress:
        options.ipAddress ?? (session ? ((session as any).ip as string) : null),
      location: options.location ?? null,
      userAgent: options.userAgent ?? null,
      message: options.message ?? null,
      metadata: options.metadata ?? null,
    });

    const reloaded = await record.reload({
      include: this._buildInclude(),
    });

    return this._toDto(reloaded);
  }

  public async getLoginLogs(
    searchDto: SearchDto,
    filter?: LoginLogFilterDto,
  ): Promise<ResponseListDto<LoginLogDto[]>> {
    const pageIndex = Math.max(1, searchDto?.pageIndex ?? 1);
    const pageSize = Math.max(1, Math.min(searchDto?.pageSize ?? 20, 200));
    const orderColumn = this._normalizeOrderColumn(searchDto?.orderByColumn);
    const orderDirection = this._normalizeOrderDirection(searchDto?.orderBy);

    const where = this._buildWhere(filter, searchDto?.search);

    const { rows, count } = await LoginLog.findAndCountAll({
      where,
      include: this._buildInclude(),
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
      order: [
        [orderColumn, orderDirection],
        ['id', orderDirection],
      ],
      distinct: true,
    });

    return {
      data: rows.map((row) => this._toDto(row)),
      total: count,
    };
  }

  public async getRecent(
    limit = 20,
    filter?: LoginLogFilterDto,
  ): Promise<LoginLogDto[]> {
    const safeLimit = Math.max(1, Math.min(limit ?? 20, 100));

    const records = await LoginLog.findAll({
      where: this._buildWhere(filter),
      include: this._buildInclude(),
      limit: safeLimit,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    return records.map((record) => this._toDto(record));
  }

  private _buildInclude(): Includeable[] {
    return [
      {
        model: Account,
        attributes: ['id', 'account', 'name', 'status'],
      },
    ];
  }

  private async _resolveAccount(
    accountId?: number | null,
    account?: string | null,
  ): Promise<Account | null> {
    if (accountId !== undefined && accountId !== null) {
      return Account.findByPk(accountId, {
        attributes: ['id', 'account', 'name', 'status'],
      });
    }

    if (account) {
      return Account.findOne({
        attributes: ['id', 'account', 'name', 'status'],
        where: { account },
      });
    }

    return null;
  }

  private _buildWhere(
    filter?: LoginLogFilterDto,
    search?: string,
  ): WhereOptions<LoginLog> {
    const where: WhereOptions<LoginLog> = {};

    if (filter?.status) {
      where['status'] = filter.status;
    }

    if (filter?.accountId !== undefined) {
      where['accountId'] = filter.accountId;
    }

    if (filter?.account) {
      where[Op.or] = [
        { accountAccountSnapshot: { [Op.like]: `%${filter.account}%` } },
        { '$account.account$': { [Op.like]: `%${filter.account}%` } },
      ];
    }

    const range: Record<string | symbol, Date> = {};
    const from = this._parseDate(filter?.from);
    const to = this._parseDate(filter?.to);
    if (from) {
      range[Op.gte] = from;
    }
    if (to) {
      range[Op.lte] = to;
    }
    if (
      Object.keys(range).length > 0 ||
      Object.getOwnPropertySymbols(range).length > 0
    ) {
      where['createdAt'] = range;
    }

    const searchText = search?.trim();
    if (searchText) {
      const searchClause = {
        [Op.or]: [
          { '$account.account$': { [Op.like]: `%${searchText}%` } },
          { '$account.name$': { [Op.like]: `%${searchText}%` } },
          { accountAccountSnapshot: { [Op.like]: `%${searchText}%` } },
          { accountNameSnapshot: { [Op.like]: `%${searchText}%` } },
          { ipAddress: { [Op.like]: `%${searchText}%` } },
          { location: { [Op.like]: `%${searchText}%` } },
          { status: { [Op.like]: `%${searchText}%` } },
        ],
      };

      if (where[Op.or]) {
        where[Op.and] = where[Op.and] ?? [];
        (where[Op.and] as any[]).push(searchClause);
      } else {
        Object.assign(where, searchClause);
      }
    }

    return where;
  }

  private _parseDate(value?: string | Date): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  private _normalizeOrderColumn(column?: string): string {
    const allowed = new Set([
      'createdAt',
      'updatedAt',
      'status',
      'ipAddress',
      'accountNameSnapshot',
      'accountAccountSnapshot',
    ]);

    if (column && allowed.has(column)) {
      return column;
    }

    return 'createdAt';
  }

  private _normalizeOrderDirection(order?: string): 'ASC' | 'DESC' {
    return order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  }

  private _toDto(record: LoginLog): LoginLogDto {
    const plain = record.get({ plain: true }) as any;
    const account = plain.account ?? null;

    const status = this._normalizeStatus(String(plain.status ?? 'success'));

    let metadata: Record<string, unknown> | null = null;
    if (plain.metadata && typeof plain.metadata === 'object') {
      metadata = plain.metadata;
    }

    return new LoginLogDto({
      id: plain.id,
      accountId: plain.accountId ?? account?.id ?? null,
      account: account?.account ?? plain.accountAccountSnapshot ?? null,
      name: account?.name ?? plain.accountNameSnapshot ?? null,
      status,
      ipAddress: plain.ipAddress ?? null,
      location: plain.location ?? null,
      userAgent: plain.userAgent ?? null,
      message: plain.message ?? null,
      metadata,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }

  private _normalizeStatus(value: string): LoginLogStatus {
    switch (value) {
      case 'success':
      case 'failed':
      case 'locked':
        return value;

      default:
        return 'failed';
    }
  }
}
