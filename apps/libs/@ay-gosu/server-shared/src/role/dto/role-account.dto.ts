// 透過 @ay-nestjs/share 產生
/* eslint-disable */

export class RoleAccountDto {
  public id: number;
  public account: string;
  public name: string;

  public constructor(json: Partial<RoleAccountDto> = {}) {
    Object.assign(this, json);
  }
}
// 45478fb5d08752f49e7703a25b384368c1f3c7985683ebe29a4e498af97b77c6
