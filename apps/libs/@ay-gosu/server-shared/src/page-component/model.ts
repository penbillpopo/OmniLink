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
// 47efbe89bcf97bfe7060068ad1172df8c1f20d8512c28a095df32e0cea80a59c
