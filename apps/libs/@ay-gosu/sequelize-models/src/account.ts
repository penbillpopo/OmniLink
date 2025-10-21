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
import { Unique } from './extra-decorator';
import { TimeStamps } from './timestamps';
import { Role } from './role';

@Table({
  tableName: 'accounts',
  paranoid: false,
})
export class Account extends TimeStamps<Account> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @Unique('account')
  @Column(DataType.STRING)
  public account: string;

  @Column(DataType.STRING)
  public password: string;

  @Column(DataType.STRING)
  public name: string;

  @AllowNull(true)
  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  public roleId?: number;

  @BelongsTo(() => Role)
  public role?: Role;
}
