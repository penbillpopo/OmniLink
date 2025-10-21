import { Account, Role } from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { Injectable } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { GetRoleListDto } from './dto/get-role-list.dto';
import { RoleAccountDto } from './dto/role-account.dto';
import { RoleDetailDto } from './dto/role-detail.dto';

@Injectable()
export class RoleService {
  public async getRoleList(
    searchDto: SearchDto,
  ): Promise<ResponseListDto<GetRoleListDto[]>> {
    const pageIndex = Math.max(1, searchDto.pageIndex ?? 1);
    const pageSize = Math.max(1, Math.min(searchDto.pageSize ?? 20, 100));
    const orderColumn = searchDto.orderByColumn ?? 'updatedAt';
    const orderDirection = (searchDto.orderBy ?? 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Role.findAndCountAll({
      attributes: ['id', 'name', 'description', 'permissions', 'updatedAt'],
      include: [
        {
          model: Account,
          attributes: ['id'],
        },
      ],
      distinct: true,
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
      order: [[orderColumn, orderDirection]],
    });

    const data = rows.map((role) => {
      const plain = role.get({ plain: true }) as any;
      const accounts: any[] = Array.isArray(plain.accounts) ? plain.accounts : [];
      return new GetRoleListDto({
        id: plain.id,
        name: plain.name,
        description: plain.description ?? undefined,
        permissions: Array.isArray(plain.permissions) ? plain.permissions : [],
        accountCount: accounts.length,
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
      attributes: ['id', 'name', 'description', 'permissions', 'updatedAt'],
      include: [
        {
          model: Account,
          attributes: ['id', 'account', 'name'],
        },
      ],
    });

    if (!role) {
      throw new Errors.ROLE_NOT_FOUND();
    }

    const plain = role.get({ plain: true }) as any;
    const accounts = (plain.accounts ?? []).map(
      (account) =>
        new RoleAccountDto({
          id: account.id,
          account: account.account,
          name: account.name,
        }),
    );

    return new RoleDetailDto({
      id: plain.id,
      name: plain.name,
      description: plain.description ?? undefined,
      permissions: Array.isArray(plain.permissions) ? plain.permissions : [],
      accounts,
      updatedAt: plain.updatedAt,
    });
  }

  public async createRole(
    name: string,
    permissions: string[],
    description?: string,
    accountIds: number[] = [],
  ): Promise<RoleDetailDto> {
    const sequelize = Role.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    const role = await sequelize.transaction(async (transaction) => {
      await this._ensureUniqueName(name, undefined, transaction);

      const created = await Role.create(
        {
          name,
          description: description ?? null,
          permissions: this._normalizePermissions(permissions),
        },
        { transaction },
      );

      await this._applyAccounts(created.id, accountIds, transaction);

      return created;
    });

    return this.getRoleDetail(role.id);
  }

  public async updateRole(
    id: number,
    name: string,
    permissions: string[],
    description?: string,
    accountIds?: number[],
  ): Promise<RoleDetailDto> {
    const sequelize = Role.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    await this.getRoleDetail(id);

    await sequelize.transaction(async (transaction) => {
      await this._ensureUniqueName(name, id, transaction);

      await Role.update(
        {
          name,
          description: description ?? null,
          permissions: this._normalizePermissions(permissions),
        },
        { where: { id }, transaction },
      );

      if (accountIds !== undefined) {
        await this._applyAccounts(id, accountIds, transaction);
      }
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

  private async _applyAccounts(
    roleId: number,
    accountIds: number[],
    transaction?: Transaction,
  ) {
    if (!Array.isArray(accountIds)) {
      return;
    }

    const uniqueIds = Array.from(
      new Set(
        accountIds.filter((id) => typeof id === 'number' && !Number.isNaN(id)),
      ),
    );

    if (!uniqueIds.length) {
      await Account.update(
        { roleId: null },
        {
          where: { roleId },
          transaction,
        },
      );
      return;
    }

    const accounts = await Account.findAll({
      attributes: ['id'],
      where: { id: uniqueIds },
      transaction,
    });

    if (accounts.length !== uniqueIds.length) {
      throw new Errors.ACCOUNT_NOT_FOUND();
    }

    await Account.update(
      { roleId: null },
      {
        where: {
          roleId,
          id: {
            [Op.notIn]: uniqueIds,
          },
        },
        transaction,
      },
    );

    await Account.update(
      { roleId },
      {
        where: { id: uniqueIds },
        transaction,
      },
    );
  }
}
