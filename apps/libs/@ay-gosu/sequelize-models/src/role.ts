import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Unique } from './extra-decorator';
import { TimeStamps } from './timestamps';
import { Account } from './account';

@Table({
  tableName: 'roles',
  paranoid: false,
})
export class Role extends TimeStamps<Role> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @Unique('role_name')
  @Column(DataType.STRING)
  public name: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public description?: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  public order: number;

  @AllowNull(false)
  @Default([])
  @Column(DataType.JSON)
  public permissions?: string[];

  @HasMany(() => Account)
  public accounts?: Account[];
}
