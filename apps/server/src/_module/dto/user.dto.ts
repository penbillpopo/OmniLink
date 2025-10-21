export class UserDto {
  public account: string;
  public accountId: number;
  public name: string;
  public roleId?: number;
  public roleName?: string;
  public permissions?: string[];

  public constructor(json: Partial<UserDto> = {}) {
    Object.assign(this, json);
  }

  public toLogString() {
    return `@User(${this.accountId})`;
  }

  public toJSON() {
    return {
      account: this.account,
      accountId: this.accountId,
      name: this.name,
      roleId: this.roleId,
      roleName: this.roleName,
      permissions: this.permissions ?? [],
    };
  }
}
