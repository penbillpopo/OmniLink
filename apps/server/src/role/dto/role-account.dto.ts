export class RoleAccountDto {
  public id: number;
  public account: string;
  public name: string;

  public constructor(json: Partial<RoleAccountDto> = {}) {
    Object.assign(this, json);
  }
}
