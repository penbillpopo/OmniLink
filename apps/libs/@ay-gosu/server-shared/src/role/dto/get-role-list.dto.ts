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
// 28b8bbf1a8b5d5d9cd707ba69dd06a2e67de1add0b0af5d0185bf8288e63c78a
