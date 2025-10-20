// 透過 @ay-nestjs/share 產生
/* eslint-disable */

export class UserDto {
  public account: string;
  public accountId: number;
  public name: string;

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
    };
  }
}
// 6a8f7f8cd3c8299591bfa8a3e142349bb313138f0f7cfe19c44f9e3321b276d7
