// 透過 @ay-nestjs/share 產生
/* eslint-disable */

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
// ab9a755a2165e6c078737fa45f9aa5b87f9adc98650fc7e3d0f61f9c9d3c571e
