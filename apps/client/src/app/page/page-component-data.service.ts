import { Injectable } from '@angular/core';
import {
  CreatePageComponentDto,
  CreatePageComponentFieldDto,
  PageComponentDetailDto,
  PageComponentFieldDto,
  PageComponentModel,
  ResponseListDto,
  UpdatePageComponentDto,
} from '@ay-gosu/server-shared';

@Injectable({ providedIn: 'root' })
export class PageComponentDataService {
  public async getComponentList(): Promise<PageComponentDetailDto[]> {
    const response =
      (await PageComponentModel.getComponentList()) as ResponseListDto<
        PageComponentDetailDto[]
      >;

    return (response?.data ?? []).map(
      (component) =>
        new PageComponentDetailDto({
          ...component,
          fields: (component?.fields ?? []).map(
            (field) => new PageComponentFieldDto(field),
          ),
        }),
    );
  }

  public async getComponentDetail(
    id: number,
  ): Promise<PageComponentDetailDto> {
    const detail = await PageComponentModel.getComponentDetail(id);
    return new PageComponentDetailDto({
      ...detail,
      fields: (detail?.fields ?? []).map(
        (field) => new PageComponentFieldDto(field),
      ),
    });
  }

  public async createComponent(
    payload: CreatePageComponentDto,
  ): Promise<PageComponentDetailDto> {
    const normalizedPayload = new CreatePageComponentDto({
      ...payload,
      fields: (payload?.fields ?? []).map(
        (field) =>
          new CreatePageComponentFieldDto({
            ...field,
          }),
      ),
    });

    const created = await PageComponentModel.createComponent(
      normalizedPayload,
    );

    return new PageComponentDetailDto({
      ...created,
      fields: (created?.fields ?? []).map(
        (field) => new PageComponentFieldDto(field),
      ),
    });
  }

  public async updateComponent(
    payload: UpdatePageComponentDto,
  ): Promise<PageComponentDetailDto> {
    const normalizedPayload = new UpdatePageComponentDto({
      ...payload,
      fields: (payload?.fields ?? []).map(
        (field) =>
          new CreatePageComponentFieldDto({
            ...field,
          }),
      ),
    });

    const updated = await PageComponentModel.updateComponent(normalizedPayload);

    return new PageComponentDetailDto({
      ...updated,
      fields: (updated?.fields ?? []).map(
        (field) => new PageComponentFieldDto(field),
      ),
    });
  }
}
