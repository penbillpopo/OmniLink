import { Password, Session, Share } from '@ay-nestjs/share-server';
import { Controller, Inject } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { SessionDto } from '../_module/session.dto';
import { AccountService } from './account.service';
import { GetAccountListDto } from './dto/get-account-list.dto';

@Controller('account')
export class AccountController {
  public constructor(
    @Inject('SERVER_JWT_KEY')
    private readonly _serverJwtKey: string,
    private _accountService: AccountService,
  ) {}

  @Share()
  public async login(
    @Session() session: SessionDto,
    account: string,
    @Password() password: string,
  ): Promise<string> {
    const user = await this._accountService.login(account, password);
    const token = jwt.sign(user.toJSON(), this._serverJwtKey);
    session.user = user;

    return token;
  }

  @Share()
  public async loginViaToken(
    @Session() session: SessionDto,
    token: string,
  ): Promise<string> {
    const user = await this._accountService.loginViaToken(token);
    session.user = user;
    return token;
  }

  @Share()
  // 註冊帳號
  public async register(
    name: string,
    account: string,
    @Password() password: string,
  ): Promise<boolean> {
    const user = await this._accountService.create(name, account, password);
    return !!user.accountId;
  }

  @Share()
  // 檢查是否已經登入
  public isLoggedIn(@Session() session: SessionDto): boolean {
    return !!session?.user;
  }

  @Share()
  // 登出帳號
  public logout(@Session() session: SessionDto) {
    session.user = null;
  }

  @Share()
  public async getAccountList(
    searchDto: SearchDto,
  ): Promise<ResponseListDto<GetAccountListDto[]>> {
    return await this._accountService.getAccountList(searchDto);
  }

  @Share()
  public async updateAccount(
    id: number,
    name: string,
    account: string,
    password?: string,
  ): Promise<boolean> {
    await this._accountService.update(id, name, account, password);
    return true;
  }

  @Share()
  public async deleteAccount(id: number): Promise<boolean> {
    await this._accountService.delete(id);
    return true;
  }
}
