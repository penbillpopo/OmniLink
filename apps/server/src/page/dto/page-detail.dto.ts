import { PageBlockDto } from './page-block.dto';
import { PageDto } from './page.dto';

export class PageDetailDto extends PageDto {
  public blocks: PageBlockDto[] = [];

  public constructor(json: Partial<PageDetailDto> = {}) {
    super(json);
    this.blocks = json.blocks ?? [];
  }
}
