// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import {
  PageComponentFieldDto,
  PageComponentFieldType,
} from './page-component-field.dto';
import { PageComponentDto } from './page-component.dto';

export class PageComponentDetailDto extends PageComponentDto {
  public fields: PageComponentFieldDto[] = [];

  public constructor(json: Partial<PageComponentDetailDto> = {}) {
    super(json);
    this.fields =
      (json.fields ?? []).map(
        (field) =>
          new PageComponentFieldDto(
            field as Partial<PageComponentFieldDto> & {
              type: PageComponentFieldType;
            },
          ),
      ) ?? [];
  }
}
// 4bc26741eb8a07c53ace2c3977f7e4a07dc26758d1fa1196d812ca8b62e68c25
