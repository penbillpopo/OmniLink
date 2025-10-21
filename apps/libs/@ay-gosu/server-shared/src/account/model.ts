// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { wsc } from '../wsc';
import { GetAccountListDto } from './dto/get-account-list.dto';

export class AccountModel {
  static login(account: string, password: string): Promise<string> {
    return wsc.execute('/ws/account/login', account, password) as any;
  }

  static loginViaToken(token: string): Promise<string> {
    return wsc.execute('/ws/account/loginViaToken', token) as any;
  }

  // 註冊帳號
  static register(
    name: string,
    account: string,
    password: string,
    roleId?: number,
    status?: 'active' | 'inactive' | 'suspended',
  ): Promise<boolean> {
    return wsc.execute(
      '/ws/account/register',
      name,
      account,
      password,
      roleId,
      status,
    ) as any;
  }

  // 檢查是否已經登入
  static isLoggedIn(): Promise<boolean> {
    return wsc.execute('/ws/account/isLoggedIn') as any;
  }

  // 登出帳號
  static logout(): Promise<any> {
    return wsc.execute('/ws/account/logout') as any;
  }

  static getAccountList(
    searchDto: SearchDto,
  ): Promise<ResponseListDto<GetAccountListDto[]>> {
    return wsc.execute('/ws/account/getAccountList', searchDto) as any;
  }

  static updateAccount(
    id: number,
    name: string,
    account: string,
    password?: string,
    roleId?: number | null,
    status?: 'active' | 'inactive' | 'suspended',
  ): Promise<boolean> {
    return wsc.execute(
      '/ws/account/updateAccount',
      id,
      name,
      account,
      password,
      roleId,
      status,
    ) as any;
  }

  static deleteAccount(id: number): Promise<boolean> {
    return wsc.execute('/ws/account/deleteAccount', id) as any;
  }
}
// b2705634f29505f423ba8f3b339b5f96c6208fdefb8c7bbe28953bdd21caf3c7
