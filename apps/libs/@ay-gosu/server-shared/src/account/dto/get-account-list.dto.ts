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
// f0e6bb86596fbc3f06a9a119bd3e2b06c4484c1a3028eb9ae1163de9277ca068
