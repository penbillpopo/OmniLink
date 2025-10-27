import { CreatePageComponentDto } from './create-page-component.dto';

export class UpdatePageComponentDto extends CreatePageComponentDto {
  public id: number;

  public constructor(json: Partial<UpdatePageComponentDto> = {}) {
    super(json);
    this.id = json.id ?? 0;
  }
}
