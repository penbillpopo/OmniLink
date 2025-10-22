// 透過 @ay-nestjs/share 產生
/* eslint-disable */

export class PageDto {
  public id: number;
  public name: string;
  public slug: string;
  public description?: string | null;
  public order: number;
  public createdAt: Date;
  public updatedAt: Date;

  public constructor(json: Partial<PageDto> = {}) {
    Object.assign(this, json);
  }
}
// ffae16be669db2b642c332fbc1c2ffb4adb16e4571426c99bb1d15cbca6ea752
