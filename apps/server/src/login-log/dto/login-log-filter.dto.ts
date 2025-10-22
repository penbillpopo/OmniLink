export class LoginLogFilterDto {
  public status?: 'success' | 'failed' | 'locked';
  public accountId?: number;
  public account?: string;
  public from?: string | Date;
  public to?: string | Date;
}
