export class NavDto {
  public id: number;
  public name: string;
  public key: string;
  public children: {
    id: number;
    name: string;
  }[];
}
