import { PageComponentDto } from './page-component.dto';
import {
  PageComponentFieldDto,
  PageComponentFieldType,
} from './page-component-field.dto';

export class PageComponentDetailDto extends PageComponentDto {
  public fields: PageComponentFieldDto[] = [];

  public constructor(json: Partial<PageComponentDetailDto> = {}) {
    super(json);
    this.fields =
      (json.fields ?? []).map(
        (field) =>
          new PageComponentFieldDto(field as Partial<PageComponentFieldDto> & {
            type: PageComponentFieldType;
          }),
      ) ?? [];
  }
}
