import { Account, Audit, Role } from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { Injectable } from '@nestjs/common';
import { Includeable, Op, WhereOptions } from 'sequelize';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { SessionDto } from '../_module/session.dto';
import { AuditLogDto } from './dto/audit-log.dto';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  public async createAuditLog(
    payload: CreateAuditLogDto,
    session?: SessionDto,
  ): Promise<AuditLogDto> {
    const normalized = this._normalizeCreatePayload(payload, session);
    const created = await Audit.create(normalized);
    const log = await Audit.findByPk(created.id, {
      include: this._buildInclude(),
    });

    if (!log) {
      throw new Errors.CREATE_FAILED('操作日誌建立失敗');
    }

    return this._toDto(log);
  }

  public async recordAction(
    options: {
      module: string;
      action: string;
      detail?: string;
      category?: string;
      metadata?: Record<string, unknown>;
      accountId?: number;
      ipAddress?: string;
    },
    session?: SessionDto,
  ): Promise<AuditLogDto> {
    return this.createAuditLog(
      new CreateAuditLogDto({
        module: options.module,
        action: options.action,
        detail: options.detail,
        category: options.category,
        accountId: options.accountId,
        metadata: options.metadata,
        ipAddress: options.ipAddress,
      }),
      session,
    );
  }

  public async getAuditList(
    searchDto: SearchDto,
    filter?: AuditLogFilterDto,
  ): Promise<ResponseListDto<AuditLogDto[]>> {
    const pageIndex = Math.max(1, searchDto?.pageIndex ?? 1);
    const pageSize = Math.max(1, Math.min(searchDto?.pageSize ?? 20, 200));
    const direction = this._normalizeOrderDirection(searchDto?.orderBy);
    const orderColumn = this._normalizeOrderColumn(searchDto?.orderByColumn);

    const where = this._buildWhere(filter, searchDto?.search);

    const { rows, count } = await Audit.findAndCountAll({
      where,
      include: this._buildInclude(),
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
      order: [
        [orderColumn, direction],
        ['id', direction],
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
    filter?: AuditLogFilterDto,
  ): Promise<AuditLogDto[]> {
    const safeLimit = Math.max(1, Math.min(limit ?? 20, 100));

    const records = await Audit.findAll({
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
        attributes: ['id', 'name', 'account', 'roleId'],
        include: [
          {
            model: Role,
            attributes: ['id', 'name'],
          },
        ],
      },
    ];
  }

  private _normalizeCreatePayload(
    payload: CreateAuditLogDto,
    session?: SessionDto,
  ) {
    const action = payload?.action?.trim();
    const module = payload?.module?.trim();

    if (!action) {
      throw new Errors.UPDATE_FAILED('請提供操作名稱');
    }

    if (!module) {
      throw new Errors.UPDATE_FAILED('請提供操作模組');
    }

    const resolved = this._resolveAccount(payload, session);

    return {
      action,
      module,
      detail: payload.detail?.trim() ?? null,
      category: payload.category?.trim() ?? null,
      accountId: resolved.accountId,
      accountNameSnapshot: resolved.accountNameSnapshot,
      accountRoleSnapshot: resolved.accountRoleSnapshot,
      ipAddress: payload.ipAddress?.trim() ?? null,
      metadata: this._normalizeMetadata(payload.metadata),
    };
  }

  private _resolveAccount(
    payload: CreateAuditLogDto,
    session?: SessionDto,
  ): {
    accountId: number | null;
    accountNameSnapshot: string | null;
    accountRoleSnapshot: string | null;
  } {
    const sessionUser = session?.user;
    const resolvedAccountId =
      payload.accountId !== undefined && payload.accountId !== null
        ? Number(payload.accountId)
        : sessionUser?.accountId;

    const accountId =
      typeof resolvedAccountId === 'number' && !Number.isNaN(resolvedAccountId)
        ? resolvedAccountId
        : null;

    const trim = (value?: string | null) =>
      typeof value === 'string' && value.trim().length > 0
        ? value.trim()
        : null;

    const accountNameSnapshot =
      trim(payload.accountNameSnapshot) ?? trim(sessionUser?.name);
    const accountRoleSnapshot =
      trim(payload.accountRoleSnapshot) ?? trim(sessionUser?.roleName);

    return {
      accountId,
      accountNameSnapshot,
      accountRoleSnapshot,
    };
  }

  private _normalizeMetadata(
    metadata?: Record<string, unknown>,
  ): Record<string, unknown> | null {
    if (!metadata) {
      return null;
    }

    if (typeof metadata !== 'object') {
      return null;
    }

    return metadata;
  }

  private _buildWhere(
    filter?: AuditLogFilterDto,
    search?: string,
  ): WhereOptions<Audit> {
    const where: WhereOptions<Audit> = {};

    if (filter?.module) {
      where['module'] = filter.module;
    }

    if (filter?.category) {
      where['category'] = filter.category;
    }

    if (filter?.accountId !== undefined) {
      where['accountId'] = filter.accountId;
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
      where[Op.or] = [
        { action: { [Op.like]: `%${searchText}%` } },
        { module: { [Op.like]: `%${searchText}%` } },
        { detail: { [Op.like]: `%${searchText}%` } },
        { accountNameSnapshot: { [Op.like]: `%${searchText}%` } },
        { accountRoleSnapshot: { [Op.like]: `%${searchText}%` } },
      ];
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
      'module',
      'action',
      'category',
      'id',
    ]);

    if (column && allowed.has(column)) {
      return column;
    }

    return 'createdAt';
  }

  private _normalizeOrderDirection(order?: string): 'ASC' | 'DESC' {
    return order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  }

  private _toDto(record: Audit): AuditLogDto {
    const plain = record.get({ plain: true }) as any;
    const account = plain.account ?? null;
    const role = account?.role ?? null;

    const operatorName =
      account?.name ?? plain.accountNameSnapshot ?? undefined;
    const operatorAccount = account?.account ?? undefined;
    const operatorRole = role?.name ?? plain.accountRoleSnapshot ?? undefined;

    const operatorDisplay =
      operatorName && operatorRole
        ? `${operatorRole} - ${operatorName}`
        : operatorName ?? undefined;

    const metadata =
      plain.metadata && typeof plain.metadata === 'object'
        ? plain.metadata
        : undefined;

    return new AuditLogDto({
      id: plain.id,
      action: plain.action,
      module: plain.module,
      detail: plain.detail ?? undefined,
      category: plain.category ?? undefined,
      operatorName,
      operatorAccount,
      operatorRole,
      operatorDisplay,
      ipAddress: plain.ipAddress ?? undefined,
      metadata,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }
}
