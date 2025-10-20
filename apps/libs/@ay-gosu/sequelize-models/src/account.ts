import {
  AutoIncrement,
  Column,
  DataType,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Unique } from './extra-decorator';
import { TimeStamps } from './timestamps';

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
}
