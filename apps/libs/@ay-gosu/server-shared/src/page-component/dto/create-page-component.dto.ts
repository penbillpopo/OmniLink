// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { CreatePageComponentFieldDto } from './create-page-component-field.dto';

export class CreatePageComponentDto {
  public name: string;
  public description?: string;
  public fields: CreatePageComponentFieldDto[] = [];

  public constructor(json: Partial<CreatePageComponentDto> = {}) {
    Object.assign(this, json);
    this.fields =
      (json.fields ?? []).map(
        (field) => new CreatePageComponentFieldDto(field),
      ) ?? [];
  }
}
// 8d81d3c524f9681d07da2d979a3f1edbbd96a00099f2a13008a59e875904c0da
