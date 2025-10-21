// 透過 @ay-nestjs/share 產生
/* eslint-disable */

export class GetAccountListDto {
  public id: number;
  public account: string;
  public name: string;
  public updatedAt: Date;
  public roleId?: number;
  public roleName?: string;
  public status: 'active' | 'inactive' | 'suspended';
  public lastLoginAt?: Date;

  public constructor(json: Partial<GetAccountListDto> = {}) {
    Object.assign(this, json);
    this.status = (json.status as any) ?? 'active';
  }
}
// 50c21abee803074f3a1bc2ce82c7f1e94f08b65d42118fdfa904ff7bbc5fead1
