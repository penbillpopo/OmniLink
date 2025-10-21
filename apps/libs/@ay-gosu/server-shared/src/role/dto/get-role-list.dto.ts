// 透過 @ay-nestjs/share 產生
/* eslint-disable */

export class GetRoleListDto {
  public id: number;
  public name: string;
  public description?: string;
  public permissions: string[];
  public order: number;
  public updatedAt: Date;

  public constructor(json: Partial<GetRoleListDto> = {}) {
    Object.assign(this, json);
    this.permissions = json.permissions ?? [];
    this.order = json.order ?? 0;
  }
}
// a62f0d94947c6a9c99cb686219d261aedec48a0ab42a861deed514849d4867dc
