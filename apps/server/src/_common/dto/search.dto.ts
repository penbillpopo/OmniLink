export class SearchDto {
  public pageSize: number;
  public pageIndex: number;
  public orderBy?: 'ASC' | 'DESC';
  public orderByColumn?: string;
  public search?: string;
}
