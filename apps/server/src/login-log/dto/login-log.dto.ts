export class LoginLogDto {
  public id: number;
  public accountId?: number | null;
  public account?: string | null;
  public name?: string | null;
  public status: 'success' | 'failed' | 'locked';
  public ipAddress?: string | null;
  public location?: string | null;
  public userAgent?: string | null;
  public message?: string | null;
  public metadata?: Record<string, unknown> | null;
  public createdAt: Date;
  public updatedAt: Date;

  public constructor(json: Partial<LoginLogDto> = {}) {
    Object.assign(this, json);
  }
}
