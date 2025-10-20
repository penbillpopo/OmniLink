import { Account } from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { HttpService } from '@nestjs/axios';
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
      attributes: ['id', 'name', 'account'],
    });
    const account = response.get();
    return new UserDto({
      accountId: account.id,
      name: account.name,
      account: account.account,
    });
  }

  public async getAccountList(
    searchDto: SearchDto,
  ): Promise<ResponseListDto<GetAccountListDto[]>> {
    const { pageIndex, pageSize, orderByColumn, orderBy } = searchDto;
    const total = await Account.count();
    const accounts = await Account.findAll({
      attributes: ['id', 'name', 'account', 'updatedAt'],
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
      order: [[orderByColumn, orderBy]],
    });
    return {
      data: accounts,
      total,
    };
  }

  public async create(
    name: string,
    account: string,
    plainPassword: string,
  ): Promise<UserDto> {
    await validate(
      new AccountHelperDto({ name, account, password: plainPassword }),
    );

    await this._accountHelperService.ensureAccountNotExist(account);

    const { hashedPassword } = await this._hashPassword(plainPassword);

    const { id } = await Account.create({
      account,
      password: hashedPassword,
      name,
    });

    return new UserDto({
      accountId: id,
      account: account,
      name,
    });
  }

  public async update(id, name, account, password): Promise<boolean> {
    const data = {
      name,
      account,
    };
    if (password) {
      const { hashedPassword } = await this._hashPassword(password);
      data['password'] = hashedPassword;
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
}
