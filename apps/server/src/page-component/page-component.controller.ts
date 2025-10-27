import { Session, Share } from '@ay-nestjs/share-server';
import { Controller } from '@nestjs/common';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SessionDto } from '../_module/session.dto';
import { CreatePageComponentDto } from './dto/create-page-component.dto';
import { PageComponentDetailDto } from './dto/page-component-detail.dto';
import { PageComponentService } from './page-component.service';
import { UpdatePageComponentDto } from './dto/update-page-component.dto';

@Controller('page-component')
export class PageComponentController {
  public constructor(
    private readonly _pageComponentService: PageComponentService,
  ) {}

  @Share()
  public async getComponentList(): Promise<
    ResponseListDto<PageComponentDetailDto[]>
  > {
    return this._pageComponentService.getComponentList();
  }

  @Share()
  public async getComponentDetail(id: number): Promise<PageComponentDetailDto> {
    return this._pageComponentService.getComponentDetail(id);
  }

  @Share()
  public async createComponent(
    @Session() session: SessionDto,
    payload: CreatePageComponentDto,
  ): Promise<PageComponentDetailDto> {
    return this._pageComponentService.createComponent(payload, session);
  }

  @Share()
  public async updateComponent(
    @Session() session: SessionDto,
    payload: UpdatePageComponentDto,
  ): Promise<PageComponentDetailDto> {
    return this._pageComponentService.updateComponent(payload, session);
  }
}
