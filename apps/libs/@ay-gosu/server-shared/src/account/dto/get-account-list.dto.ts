// 透過 @ay-nestjs/share 產生
/* eslint-disable */

export class GetAccountListDto {
  public id: number;
  public account: string;
  public name: string;
  public updatedAt: Date;
  public roleId?: number;
  public roleName?: string;
  public permissions: string[];

  public constructor(json: Partial<GetAccountListDto> = {}) {
    Object.assign(this, json);
    this.permissions = json.permissions ?? [];
  }
}
// edbee719912c4221ce6ad4b57b75cfeec2223b6fec055a42dd544c8f4dff74aa
