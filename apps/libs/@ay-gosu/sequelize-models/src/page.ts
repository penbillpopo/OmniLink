import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { TimeStamps } from './timestamps';
import { PageBlock } from './page-block';

@Table({
  tableName: 'pages',
  paranoid: false,
})
export class Page extends TimeStamps<Page> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  public name: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  public slug: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public description?: string | null;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  public order: number;

  @HasMany(() => PageBlock, { onDelete: 'CASCADE' })
  public blocks?: PageBlock[];
}
