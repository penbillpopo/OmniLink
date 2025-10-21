import { Injectable } from '@angular/core';
import {
  AccountModel,
  GetAccountListDto,
  ResponseListDto,
  SearchDto,
} from '@ay-gosu/server-shared';

export type AccountStatus = 'active' | 'inactive' | 'suspended';

type AccountListResponse = {
  data: GetAccountListDto[];
  total: number;
};

@Injectable({ providedIn: 'root' })
export class AccountDataService {
  public async getAccounts(
    search: Partial<SearchDto> = {},
  ): Promise<AccountListResponse> {
    const fallback: SearchDto = {
      pageIndex: 1,
      pageSize: 200,
      orderBy: 'DESC',
      orderByColumn: 'updatedAt',
    };

    const response = (await AccountModel.getAccountList({
      ...fallback,
      ...search,
    })) as ResponseListDto<GetAccountListDto[]>;

    return {
      data: (response?.data ?? []).map((item) => new GetAccountListDto(item)),
      total: response?.total ?? 0,
    };
  }

  public async createAccount(payload: {
    name: string;
    account: string;
    password: string;
    roleId?: number;
    status?: AccountStatus;
  }): Promise<boolean> {
    return AccountModel.register(
      payload.name,
      payload.account,
      payload.password,
      payload.roleId,
      payload.status,
    );
  }

  public async updateAccount(payload: {
    id: number;
    name: string;
    account: string;
    password?: string;
    roleId?: number | null;
    status?: AccountStatus;
  }): Promise<boolean> {
    return AccountModel.updateAccount(
      payload.id,
      payload.name,
      payload.account,
      payload.password,
      payload.roleId,
      payload.status,
    );
  }

  public async deleteAccount(id: number): Promise<boolean> {
    return AccountModel.deleteAccount(id);
  }
}
