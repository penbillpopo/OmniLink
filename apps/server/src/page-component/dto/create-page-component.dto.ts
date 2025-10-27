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
