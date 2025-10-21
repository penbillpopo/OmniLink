export class RoleDetailDto {
  public id: number;
  public name: string;
  public description?: string;
  public permissions: string[];
  public order: number;
  public updatedAt: Date;

  public constructor(json: Partial<RoleDetailDto> = {}) {
    Object.assign(this, json);
    this.permissions = json.permissions ?? [];
    this.order = json.order ?? 0;
  }
}
// 2960b6f5a5376b67e83967dc90e56d5a31436da7d5fbea7f88f66cc5a4071a4b
