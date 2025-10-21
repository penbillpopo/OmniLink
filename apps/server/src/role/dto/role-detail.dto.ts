import { RoleAccountDto } from './role-account.dto';

export class RoleDetailDto {
  public id: number;
  public name: string;
  public description?: string;
  public permissions: string[];
  public accounts: RoleAccountDto[];
  public accountIds: number[];
  public updatedAt: Date;

  public constructor(json: Partial<RoleDetailDto> = {}) {
    Object.assign(this, json);
    this.permissions = json.permissions ?? [];
    const accounts = json.accounts ?? [];
    this.accounts = accounts.map((account) =>
      account instanceof RoleAccountDto ? account : new RoleAccountDto(account),
    );
    this.accountIds =
      json.accountIds ??
      this.accounts
        .map((account) => account.id)
        .filter((id) => typeof id === 'number');
  }
}
