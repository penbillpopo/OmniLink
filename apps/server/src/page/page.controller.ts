import { Session, Share } from '@ay-nestjs/share-server';
import { Controller } from '@nestjs/common';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SessionDto } from '../_module/session.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { CreatePageBlockDto } from './dto/create-page-block.dto';
import { PageBlockDto } from './dto/page-block.dto';
import { PageDetailDto } from './dto/page-detail.dto';
import { PageDto } from './dto/page.dto';
import { PageService } from './page.service';

@Controller('page')
export class PageController {
  public constructor(private readonly _pageService: PageService) {}

  @Share()
  public async getPageList(): Promise<ResponseListDto<PageDto[]>> {
    return this._pageService.getPageList();
  }

  @Share()
  public async getPageDetail(id: number): Promise<PageDetailDto> {
    return this._pageService.getPageDetail(id);
  }

  @Share()
  public async createPage(
    @Session() session: SessionDto,
    payload: CreatePageDto,
  ): Promise<PageDetailDto> {
    return this._pageService.createPage(payload, session);
  }

  @Share()
  public async createPageBlock(
    @Session() session: SessionDto,
    payload: CreatePageBlockDto,
  ): Promise<PageBlockDto> {
    return this._pageService.createPageBlock(payload, session);
  }

  @Share()
  public async deletePageBlock(
    @Session() session: SessionDto,
    id: number,
  ): Promise<boolean> {
    return this._pageService.deletePageBlock(id, session);
  }
}
