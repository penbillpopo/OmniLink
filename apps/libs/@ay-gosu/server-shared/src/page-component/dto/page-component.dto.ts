// 透過 @ay-nestjs/share 產生
/* eslint-disable */

export class PageComponentDto {
  public id: number;
  public name: string;
  public slug: string;
  public description?: string | null;
  public order: number;
  public createdAt: Date;
  public updatedAt: Date;

  public constructor(json: Partial<PageComponentDto> = {}) {
    Object.assign(this, json);
  }
}
// f4d0abb2646b58fe6206f14a1f5be5811faa9c884d812c579fb3c2fb2cfc73e1
