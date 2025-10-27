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
