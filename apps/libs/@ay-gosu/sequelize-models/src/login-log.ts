import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Account } from './account';
import { TimeStamps } from './timestamps';

@Table({
  tableName: 'login_logs',
  paranoid: false,
})
export class LoginLog extends TimeStamps<LoginLog> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @AllowNull(true)
  @ForeignKey(() => Account)
  @Column(DataType.INTEGER)
  public accountId?: number | null;

  @BelongsTo(() => Account)
  public account?: Account;

  @AllowNull(true)
  @Column(DataType.STRING)
  public accountAccountSnapshot?: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  public accountNameSnapshot?: string | null;

  @AllowNull(false)
  @Column(DataType.STRING)
  public status: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public ipAddress?: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  public location?: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  public userAgent?: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  public message?: string | null;

  @AllowNull(true)
  @Column(DataType.JSON)
  public metadata?: Record<string, unknown>;
}
