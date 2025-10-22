// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { PageBlockDto } from './page-block.dto';
import { PageDto } from './page.dto';

export class PageDetailDto extends PageDto {
  public blocks: PageBlockDto[] = [];

  public constructor(json: Partial<PageDetailDto> = {}) {
    super(json);
    this.blocks = json.blocks ?? [];
  }
}
// f4c558680f8186b52032e90ef72cc60f8ad03fc2baf76de04eed9dbe9c788e44
