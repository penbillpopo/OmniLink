// 透過 @ay-nestjs/share 產生
/* eslint-disable */

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
// ae864336135badabca7c4a8297b30042166b7c3371c4697ddcb6955332d0422f
