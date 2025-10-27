// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { CreatePageComponentDto } from './create-page-component.dto';

export class UpdatePageComponentDto extends CreatePageComponentDto {
  public id: number;

  public constructor(json: Partial<UpdatePageComponentDto> = {}) {
    super(json);
    this.id = json.id ?? 0;
  }
}
// f0fd69ad849f1d942a3fcc67f970e3fa0fbd0bf5d5761e9af1b82f98baa97fdc
