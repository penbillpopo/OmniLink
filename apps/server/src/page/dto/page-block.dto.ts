export type PageBlockType = 'carousel' | 'banner' | 'image_text' | 'component';

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
