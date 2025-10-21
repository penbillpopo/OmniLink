import { Account, Role } from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { Injectable } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { GetRoleListDto } from './dto/get-role-list.dto';
import { RoleDetailDto } from './dto/role-detail.dto';

@Injectable()
export class RoleService {
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

    return this.getRoleDetail(role.id);
  }

  public async updateRole(
    id: number,
    name: string,
    permissions: string[],
    description?: string,
    order?: number,
  ): Promise<RoleDetailDto> {
    const sequelize = Role.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    await this.getRoleDetail(id);

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

    return this.getRoleDetail(id);
  }

  public async deleteRole(id: number): Promise<boolean> {
    const sequelize = Role.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    await this.getRoleDetail(id);

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

    return true;
  }

  public async reorderRoles(
    entries: { id: number; order: number }[],
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
