// 透過 @ay-nestjs/share 產生
/* eslint-disable */

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
// 4a46f01b1ba086e47085f49a473fca506e5ede6b976ef6ec4ef3310a97bca8aa
