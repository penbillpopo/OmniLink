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
