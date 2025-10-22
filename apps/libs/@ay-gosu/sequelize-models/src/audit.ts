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
  tableName: 'audits',
  paranoid: false,
})
export class Audit extends TimeStamps<Audit> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  public action: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public module: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  public detail?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public category?: string;

  @AllowNull(true)
  @ForeignKey(() => Account)
  @Column(DataType.INTEGER)
  public accountId?: number;

  @BelongsTo(() => Account)
  public account?: Account;

  @AllowNull(true)
  @Column(DataType.STRING)
  public accountNameSnapshot?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public accountRoleSnapshot?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public ipAddress?: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  public metadata?: Record<string, unknown>;
}
