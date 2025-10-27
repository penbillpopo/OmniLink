// 透過 @ay-nestjs/share 產生
/* eslint-disable */

export type PageComponentFieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'button'
  | 'link'
  | 'richtext'
  | 'property';

export class PageComponentFieldDto {
  public id: number;
  public componentId: number;
  public key: string;
  public type: PageComponentFieldType;
  public property?: string | null;
  public order: number;
  public createdAt: Date;
  public updatedAt: Date;

  public constructor(json: Partial<PageComponentFieldDto> = {}) {
    Object.assign(this, json);
  }
}
// 09bf63bcf96afea557d3f114a55dd60f3d1d8ba0e4db61d7c7cbaf888deddcf9
