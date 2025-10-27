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
// 5f04673d737a09c154ad48fc8d4942be3571cc742c0f1db4705ddd9938d68964
