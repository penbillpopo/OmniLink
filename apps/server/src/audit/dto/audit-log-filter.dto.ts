export class AuditLogFilterDto {
  public module?: string;
  public category?: string;
  public accountId?: number;
  public from?: string | Date;
  public to?: string | Date;
}
