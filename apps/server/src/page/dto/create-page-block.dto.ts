import { PageBlockType } from './page-block.dto';

export class CreatePageBlockDto {
  public pageId: number;
  public name: string;
  public type: PageBlockType;
  public content?: Record<string, unknown> | null;
}
