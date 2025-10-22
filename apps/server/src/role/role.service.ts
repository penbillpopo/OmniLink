import { Account, Role } from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { Injectable } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { SessionDto } from '../_module/session.dto';
import { AuditService } from '../audit/audit.service';
import { GetRoleListDto } from './dto/get-role-list.dto';
import { RoleDetailDto } from './dto/role-detail.dto';

@Injectable()
export class RoleService {
  public constructor(private readonly _auditService: AuditService) {}

  public async getRoleList(
    searchDto: SearchDto,
  ): Promise<ResponseListDto<GetRoleListDto[]>> {
    const pageIndex = Math.max(1, searchDto.pageIndex ?? 1);
    const pageSize = Math.max(1, Math.min(searchDto.pageSize ?? 20, 100));

    const { rows, count } = await Role.findAndCountAll({
      attributes: ['id', 'name', 'description', 'permissions', 'order', 'updatedAt'],
      distinct: true,
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
      order: [
        ['order', 'ASC'],
        ['updatedAt', 'DESC'],
      ],
    });

    const data = rows.map((role) => {
      const plain = role.get({ plain: true }) as any;
      return new GetRoleListDto({
        id: plain.id,
        name: plain.name,
        description: plain.description ?? undefined,
        permissions: Array.isArray(plain.permissions) ? plain.permissions : [],
        order: typeof plain.order === 'number' ? plain.order : 0,
        updatedAt: plain.updatedAt,
      });
    });

    return {
      data,
      total: count,
    };
  }

  public async getRoleDetail(id: number): Promise<RoleDetailDto> {
    const role = await Role.findByPk(id, {
      attributes: ['id', 'name', 'description', 'permissions', 'order', 'updatedAt'],
    });

    if (!role) {
      throw new Errors.ROLE_NOT_FOUND();
    }

    const plain = role.get({ plain: true }) as any;

    return new RoleDetailDto({
      id: plain.id,
      name: plain.name,
      description: plain.description ?? undefined,
      permissions: Array.isArray(plain.permissions) ? plain.permissions : [],
      order: typeof plain.order === 'number' ? plain.order : 0,
      updatedAt: plain.updatedAt,
    });
  }

  public async createRole(
    name: string,
    permissions: string[],
    description?: string,
    session?: SessionDto,
  ): Promise<RoleDetailDto> {
    const sequelize = Role.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    const role = await sequelize.transaction(async (transaction) => {
      await this._ensureUniqueName(name, undefined, transaction);
      const nextOrder = await this._getNextOrder(transaction);

      const created = await Role.create(
        {
          name,
          description: description ?? null,
          permissions: this._normalizePermissions(permissions),
          order: nextOrder,
        },
        { transaction },
      );

      return created;
    });

    const detail = await this.getRoleDetail(role.id);

    await this._auditService.recordAction(
      {
        module: 'role',
        category: 'create',
        action: '新增角色',
        detail: `新增角色 ${detail.name}`,
        metadata: {
          roleId: detail.id,
          permissions: detail.permissions ?? [],
        },
      },
      session,
    );

    return detail;
  }

  public async updateRole(
    id: number,
    name: string,
    permissions: string[],
    description?: string,
    order?: number,
    session?: SessionDto,
  ): Promise<RoleDetailDto> {
    const sequelize = Role.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    const before = await this.getRoleDetail(id);

    await sequelize.transaction(async (transaction) => {
      await this._ensureUniqueName(name, id, transaction);

      const payload: Partial<Role> = {
        name,
        description: description ?? null,
        permissions: this._normalizePermissions(permissions),
      };

      if (order !== undefined) {
        payload['order'] = order;
      }

      await Role.update(
        payload,
        { where: { id }, transaction },
      );

    });

    const detail = await this.getRoleDetail(id);

    await this._auditService.recordAction(
      {
        module: 'role',
        category: 'update',
        action: '更新角色',
        detail: `更新角色 ${detail.name}`,
        metadata: {
          roleId: detail.id,
          updates: {
            name,
            description: description ?? null,
            order: order ?? null,
            permissions: permissions ?? [],
          },
          previous: {
            name: before.name,
            description: before.description ?? null,
            order: before.order ?? null,
            permissions: before.permissions ?? [],
          },
        },
      },
      session,
    );

    return detail;
  }

  public async deleteRole(id: number, session?: SessionDto): Promise<boolean> {
    const sequelize = Role.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    const detail = await this.getRoleDetail(id);

    await sequelize.transaction(async (transaction) => {
      await Account.update(
        { roleId: null },
        {
          where: { roleId: id },
          transaction,
        },
      );

      const deleted = await Role.destroy({ where: { id }, transaction });
      if (!deleted) {
        throw new Errors.DELETE_FAILED('角色刪除失敗');
      }
    });

    await this._auditService.recordAction(
      {
        module: 'role',
        category: 'delete',
        action: '刪除角色',
        detail: `刪除角色 ${detail.name}`,
        metadata: {
          roleId: detail.id,
        },
      },
      session,
    );

    return true;
  }

  public async reorderRoles(
    entries: { id: number; order: number }[],
    session?: SessionDto,
  ): Promise<boolean> {
    if (!Array.isArray(entries) || !entries.length) {
      return true;
    }

    const sequelize = Role.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    const uniqueIds = new Set(entries.map((entry) => entry.id));
    if (uniqueIds.size !== entries.length) {
      throw new Errors.UPDATE_FAILED('排序資料重複');
    }

    await sequelize.transaction(async (transaction) => {
      const roles = await Role.findAll({
        attributes: ['id'],
        where: { id: Array.from(uniqueIds) },
        transaction,
      });

      if (roles.length !== entries.length) {
        throw new Errors.ROLE_NOT_FOUND();
      }

      for (const entry of entries) {
        await Role.update(
          { order: entry.order },
          { where: { id: entry.id }, transaction },
        );
      }
    });

    await this._auditService.recordAction(
      {
        module: 'role',
        category: 'update',
        action: '調整角色排序',
        detail: '更新角色排序順序',
        metadata: {
          updates: entries,
        },
      },
      session,
    );

    return true;
  }

  private _normalizePermissions(permissions?: string[]): string[] {
    if (!Array.isArray(permissions)) {
      return [];
    }

    return Array.from(
      new Set(
        permissions
          .filter((permission) => typeof permission === 'string')
          .map((permission) => permission.trim())
          .filter((permission) => permission.length > 0),
      ),
    );
  }

  private async _ensureUniqueName(
    name: string,
    excludeId?: number,
    transaction?: Transaction,
  ) {
    const where: any = { name };
    if (excludeId !== undefined) {
      where.id = { [Op.ne]: excludeId };
    }

    const exists = await Role.count({ where, transaction });
    if (exists > 0) {
      throw new Errors.ROLE_EXIST();
    }
  }

  private async _getNextOrder(transaction?: Transaction): Promise<number> {
    const maxOrder = await Role.max<number, Role>('order', { transaction });
    if (typeof maxOrder === 'number' && !Number.isNaN(maxOrder)) {
      return maxOrder + 1;
    }
    return 0;
  }
}
