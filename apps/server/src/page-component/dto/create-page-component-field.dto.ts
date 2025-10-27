import { PageComponentFieldType } from './page-component-field.dto';

export class CreatePageComponentFieldDto {
  public key: string;
  public type: PageComponentFieldType;
  public property?: string;

  public constructor(json: Partial<CreatePageComponentFieldDto> = {}) {
    Object.assign(this, json);
  }
}
