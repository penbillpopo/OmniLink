// 透過 @ay-nestjs/share 產生
/* eslint-disable */

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
// 3a6fb26d76f5b43e439fcc5f93c94b1b7a9503191f521b0ff37d62f0a54b0eb1
