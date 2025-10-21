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
