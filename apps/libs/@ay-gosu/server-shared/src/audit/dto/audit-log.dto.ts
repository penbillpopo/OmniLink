// 透過 @ay-nestjs/share 產生
/* eslint-disable */

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
// 325342dfc10cd83b926d43ccbe3b0c0194a74302d432648d8ddac9494500ecf1
