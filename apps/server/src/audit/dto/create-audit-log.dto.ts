export class CreateAuditLogDto {
  public action: string;
  public module: string;
  public detail?: string;
  public category?: string;
  public accountId?: number;
  public accountNameSnapshot?: string;
  public accountRoleSnapshot?: string;
  public ipAddress?: string;
  public metadata?: Record<string, unknown>;

  public constructor(json: Partial<CreateAuditLogDto> = {}) {
    Object.assign(this, json);
  }
}
