import { Account, Role } from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import * as jwt from 'jsonwebtoken';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { UserDto } from '../_module/dto/user.dto';
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

    const payload = await this.fetchUserDto(accountId);

    return payload;
  }

  public async loginViaToken(token: string): Promise<UserDto> {
    const oldPayload = jwt.verify(token, this._serverJwtKey) as UserDto;
    const accountId = oldPayload.accountId;
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
    const total = await Account.count();
    const accounts = await Account.findAll({
      attributes: ['id', 'name', 'account', 'updatedAt', 'roleId'],
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'permissions'],
        },
      ],
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
      order: [[orderByColumn, orderBy]],
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
          permissions: Array.isArray(role?.permissions)
            ? (role.permissions as string[])
            : [],
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
  ): Promise<UserDto> {
    await validate(
      new AccountHelperDto({ name, account, password: plainPassword }),
    );

    await this._accountHelperService.ensureAccountNotExist(account);

    await this._ensureRoleExists(roleId);

    const { hashedPassword } = await this._hashPassword(plainPassword);

    const { id } = await Account.create({
      account,
      password: hashedPassword,
      name,
      roleId: roleId ?? null,
    });

    return this.fetchUserDto(id);
  }

  public async update(
    id: number,
    name: string,
    account: string,
    password?: string,
    roleId?: number | null,
  ): Promise<boolean> {
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
    await Account.update(data, {
      where: {
        id,
      },
    });
    return true;
  }

  public async delete(id: number): Promise<boolean> {
    await Account.destroy({
      where: {
        id,
      },
    });
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
}
