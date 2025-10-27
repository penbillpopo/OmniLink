// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { PageComponentFieldType } from './page-component-field.dto';

export class CreatePageComponentFieldDto {
  public key: string;
  public type: PageComponentFieldType;
  public property?: string;

  public constructor(json: Partial<CreatePageComponentFieldDto> = {}) {
    Object.assign(this, json);
  }
}
// ca7ef2ea7b2cd42aa89fbd39eaa83af362f9fe8a4b76a8965108a71b12bb1ffb
