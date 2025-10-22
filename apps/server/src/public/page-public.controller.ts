import { Controller, Get, Param } from '@nestjs/common';
import { PageDetailDto } from '../page/dto/page-detail.dto';
import { PageService } from '../page/page.service';

@Controller('api')
export class PagePublicController {
  public constructor(private readonly _pageService: PageService) {}

  @Get(':slug')
  public async getPageBySlug(@Param('slug') slug: string): Promise<PageDetailDto> {
    return this._pageService.getPageDetailBySlug(slug);
  }
}
