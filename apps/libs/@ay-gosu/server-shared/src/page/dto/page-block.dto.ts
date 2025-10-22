// 透過 @ay-nestjs/share 產生
/* eslint-disable */

export type PageBlockType = 'carousel' | 'banner' | 'image_text';

export class PageBlockDto {
  public id: number;
  public pageId: number;
  public name: string;
  public type: PageBlockType;
  public content?: Record<string, unknown> | null;
  public order: number;
  public createdAt: Date;
  public updatedAt: Date;

  public constructor(json: Partial<PageBlockDto> = {}) {
    Object.assign(this, json);
  }
}
// 788fc99b27bd9c515576fb40b6e8eaecfa56bce6bff9737ac1618bc9aae9db2b
