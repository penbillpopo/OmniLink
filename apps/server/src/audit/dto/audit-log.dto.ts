export class AuditLogDto {
  public id: number;
  public action: string;
  public module: string;
  public detail?: string;
  public category?: string;
  public operatorName?: string;
  public operatorAccount?: string;
  public operatorRole?: string;
  public operatorDisplay?: string;
  public ipAddress?: string;
  public metadata?: Record<string, unknown>;
  public createdAt: Date;
  public updatedAt: Date;

  public constructor(json: Partial<AuditLogDto> = {}) {
    Object.assign(this, json);
  }
}
