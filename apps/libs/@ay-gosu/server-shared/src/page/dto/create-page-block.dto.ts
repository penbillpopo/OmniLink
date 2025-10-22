// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { PageBlockType } from './page-block.dto';

export class CreatePageBlockDto {
  public pageId: number;
  public name: string;
  public type: PageBlockType;
  public content?: Record<string, unknown> | null;
}
// 14a8543530907b84f371eb049a174803f2c1707e0828d992a6a9ad5a5a55383d
