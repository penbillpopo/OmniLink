// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { wsc } from '../wsc';
import { CreatePageComponentDto } from './dto/create-page-component.dto';
import { PageComponentDetailDto } from './dto/page-component-detail.dto';
import { UpdatePageComponentDto } from './dto/update-page-component.dto';

export class PageComponentModel {
  static getComponentList(): Promise<
    ResponseListDto<PageComponentDetailDto[]>
  > {
    return wsc.execute('/ws/page-component/getComponentList') as any;
  }

  static getComponentDetail(id: number): Promise<PageComponentDetailDto> {
    return wsc.execute('/ws/page-component/getComponentDetail', id) as any;
  }

  static createComponent(
    payload: CreatePageComponentDto,
  ): Promise<PageComponentDetailDto> {
    return wsc.execute('/ws/page-component/createComponent', payload) as any;
  }

  static updateComponent(
    payload: UpdatePageComponentDto,
  ): Promise<PageComponentDetailDto> {
    return wsc.execute('/ws/page-component/updateComponent', payload) as any;
  }
}
// 29cc73d06764bdcb552da93857a1736cd3695481148d7a6e023a5be4aec38983
