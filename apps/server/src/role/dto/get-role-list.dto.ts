export class GetRoleListDto {
  public id: number;
  public name: string;
  public description?: string;
  public permissions: string[];
  public accountCount: number;
  public updatedAt: Date;

  public constructor(json: Partial<GetRoleListDto> = {}) {
    Object.assign(this, json);
    this.permissions = json.permissions ?? [];
    this.accountCount = json.accountCount ?? 0;
  }
}
