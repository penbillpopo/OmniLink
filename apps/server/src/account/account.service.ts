import { Account, Role } from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import * as jwt from 'jsonwebtoken';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { UserDto } from '../_module/dto/user.dto';
import { SessionDto } from '../_module/session.dto';
import { AuditService } from '../audit/audit.service';
import {
  AccountHelperDto,
  AccountHelperService,
} from './account-helper.service';
import { GetAccountListDto } from './dto/get-account-list.dto';

@Injectable()
export class AccountService {
  public constructor(
    private _accountHelperService: AccountHelperService,
    @Inject('SERVER_JWT_KEY')
    private readonly _serverJwtKey: string,
    private readonly _auditService: AuditService,
  ) {}

  public async login(account: string, password: string): Promise<UserDto> {
    const row = await Account.findOne({
      attributes: ['id'],
      where: { account },
    });

    if (row === null) {
      throw new Errors.ACCOUNT_NOT_FOUND();
    }

    const { id: accountId } = row;

    await this.ensurePassword(accountId, password);

    await Account.update(
      { lastLoginAt: new Date() },
      { where: { id: accountId } },
    );

    const payload = await this.fetchUserDto(accountId);

    return payload;
  }

  public async loginViaToken(token: string): Promise<UserDto> {
    const oldPayload = jwt.verify(token, this._serverJwtKey) as UserDto;
    const accountId = oldPayload.accountId;
    await Account.update(
      { lastLoginAt: new Date() },
      { where: { id: accountId } },
    );
    const user = await this.fetchUserDto(accountId);
    return user;
  }

  public async ensurePassword(accountId: number, oldPassword: string) {
    const account = await Account.findOne({
      attributes: ['password'],
      where: { id: accountId },
    });

    if (!account) {
      throw new Errors.ACCOUNT_NOT_FOUND();
    }

    if (!bcrypt.compareSync(oldPassword, account.password)) {
      throw new Errors.WRONG_PASSWORD();
    }

    return;
  }

  public async fetchUserDto(accountId: number): Promise<UserDto> {
    const response = await Account.findByPk(accountId, {
      attributes: ['id', 'name', 'account', 'roleId'],
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'permissions'],
        },
      ],
    });

    if (!response) {
      throw new Errors.ACCOUNT_NOT_FOUND();
    }

    const account = response.get();
    const role = (response as any).role ?? null;
    const permissions = Array.isArray(role?.permissions)
      ? (role.permissions as string[])
      : [];

    return new UserDto({
      accountId: account.id,
      name: account.name,
      account: account.account,
      roleId: account.roleId ?? role?.id,
      roleName: role?.name,
      permissions,
    });
  }

  public async getAccountList(
    searchDto: SearchDto,
  ): Promise<ResponseListDto<GetAccountListDto[]>> {
    const { pageIndex, pageSize, orderByColumn, orderBy } = searchDto;
    const orderColumn = orderByColumn ?? 'updatedAt';
    const orderDirection = (orderBy ?? 'DESC') as 'ASC' | 'DESC';
    const total = await Account.count();
    const accounts = await Account.findAll({
      attributes: [
        'id',
        'name',
        'account',
        'updatedAt',
        'roleId',
        'status',
        'lastLoginAt',
      ],
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'permissions'],
        },
      ],
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
      order: [[orderColumn, orderDirection]],
    });
    return {
      data: accounts.map((account) => {
        const plain = account.get({ plain: true }) as any;
        const role = plain.role ?? null;
        return new GetAccountListDto({
          id: plain.id,
          account: plain.account,
          name: plain.name,
          updatedAt: plain.updatedAt,
          roleId: plain.roleId ?? role?.id,
          roleName: role?.name,
          status: plain.status ?? 'active',
          lastLoginAt: plain.lastLoginAt ?? undefined,
        });
      }),
      total,
    };
  }

  public async create(
    name: string,
    account: string,
    plainPassword: string,
    roleId?: number,
    status: 'active' | 'inactive' | 'suspended' = 'active',
    session?: SessionDto,
  ): Promise<UserDto> {
    await validate(
      new AccountHelperDto({ name, account, password: plainPassword }),
    );

    await this._accountHelperService.ensureAccountNotExist(account);

    await this._ensureRoleExists(roleId);
    this._ensureValidStatus(status);

    const normalizedStatus: 'active' | 'inactive' | 'suspended' =
      status ?? 'active';

    const { hashedPassword } = await this._hashPassword(plainPassword);

    const { id } = await Account.create({
      account,
      password: hashedPassword,
      name,
      roleId: roleId ?? null,
      status: normalizedStatus,
    });

    const user = await this.fetchUserDto(id);

    await this._auditService.recordAction(
      {
        module: 'account',
        category: 'create',
        action: '新增管理員帳號',
        detail: `新增帳號 ${user.account}（${user.name ?? '未命名使用者'}）`,
        metadata: {
          targetAccountId: user.accountId,
          account: user.account,
          name: user.name ?? null,
          roleId: roleId ?? null,
          status: normalizedStatus,
        },
      },
      session,
    );

    return user;
  }

  public async update(
    id: number,
    name: string,
    account: string,
    password?: string,
    roleId?: number | null,
    status?: 'active' | 'inactive' | 'suspended',
    session?: SessionDto,
  ): Promise<boolean> {
    const original = await Account.findByPk(id, {
      attributes: ['id', 'name', 'account', 'roleId', 'status'],
    });

    if (!original) {
      throw new Errors.ACCOUNT_NOT_FOUND();
    }

    const originalPlain = original.get({ plain: true }) as any;

    const data = {
      name,
      account,
    };
    if (password) {
      const { hashedPassword } = await this._hashPassword(password);
      data['password'] = hashedPassword;
    }
    if (roleId !== undefined) {
      await this._ensureRoleExists(roleId);
      data['roleId'] = roleId;
    }
    if (status !== undefined) {
      this._ensureValidStatus(status);
      data['status'] = status;
    }
    await Account.update(data, {
      where: {
        id,
      },
    });

    const updated = await Account.findByPk(id, {
      attributes: ['id', 'name', 'account', 'roleId', 'status'],
    });

    const updatedPlain = updated
      ? (updated.get({ plain: true }) as any)
      : originalPlain;

    await this._auditService.recordAction(
      {
        module: 'account',
        category: 'update',
        action: '更新管理員帳號',
        detail: `更新帳號 ${
          updatedPlain.account ?? originalPlain.account
        }（${updatedPlain.name ?? originalPlain.name ?? '未命名使用者'}）`,
        metadata: {
          targetAccountId: id,
          updates: {
            ...(name !== undefined ? { name } : {}),
            ...(account !== undefined ? { account } : {}),
            ...(roleId !== undefined ? { roleId } : {}),
            ...(status !== undefined ? { status } : {}),
            passwordChanged: Boolean(password),
          },
        },
      },
      session,
    );

    return true;
  }

  public async delete(id: number, session?: SessionDto): Promise<boolean> {
    const target = await Account.findByPk(id, {
      attributes: ['id', 'name', 'account', 'roleId', 'status'],
    });

    if (!target) {
      throw new Errors.ACCOUNT_NOT_FOUND();
    }

    const plain = target.get({ plain: true }) as any;

    const deleted = await Account.destroy({
      where: {
        id,
      },
    });

    if (!deleted) {
      throw new Errors.DELETE_FAILED('管理員帳號刪除失敗');
    }

    await this._auditService.recordAction(
      {
        module: 'account',
        category: 'delete',
        action: '刪除管理員帳號',
        detail: `刪除帳號 ${plain.account}（${
          plain.name ?? '未命名使用者'
        }）`,
        metadata: {
          targetAccountId: id,
          roleId: plain.roleId ?? null,
          status: plain.status ?? null,
        },
      },
      session,
    );

    return true;
  }

  private async _hashPassword(hashedPassword: string) {
    hashedPassword = bcrypt.hashSync(hashedPassword, 10);

    return { hashedPassword };
  }

  private async _ensureRoleExists(roleId?: number | null) {
    if (roleId === undefined || roleId === null) {
      return;
    }

    const exists = await Role.count({ where: { id: roleId } });
    if (!exists) {
      throw new Errors.ROLE_NOT_FOUND();
    }
  }

  private _ensureValidStatus(status: string) {
    const allowed = ['active', 'inactive', 'suspended'];
    if (!allowed.includes(status)) {
      throw new Errors.UPDATE_FAILED('無效的帳號狀態');
    }
  }
}
