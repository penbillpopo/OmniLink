// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { wsc } from '../wsc';
import { CreatePageBlockDto } from './dto/create-page-block.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { PageBlockDto } from './dto/page-block.dto';
import { PageDetailDto } from './dto/page-detail.dto';
import { PageDto } from './dto/page.dto';

export class PageModel {
  static getPageList(): Promise<ResponseListDto<PageDto[]>> {
    return wsc.execute('/ws/page/getPageList') as any;
  }

  static getPageDetail(id: number): Promise<PageDetailDto> {
    return wsc.execute('/ws/page/getPageDetail', id) as any;
  }

  static createPage(payload: CreatePageDto): Promise<PageDetailDto> {
    return wsc.execute('/ws/page/createPage', payload) as any;
  }

  static createPageBlock(payload: CreatePageBlockDto): Promise<PageBlockDto> {
    return wsc.execute('/ws/page/createPageBlock', payload) as any;
  }

  static deletePageBlock(id: number): Promise<boolean> {
    return wsc.execute('/ws/page/deletePageBlock', id) as any;
  }
}
// 18fd701289c75023716dda1907d7e164c0503df54f6c9780697d0b1ba3312ef8
