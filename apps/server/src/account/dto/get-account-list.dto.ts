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
