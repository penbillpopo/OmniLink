import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Page } from './page';
import { TimeStamps } from './timestamps';

@Table({
  tableName: 'page_blocks',
  paranoid: false,
})
export class PageBlock extends TimeStamps<PageBlock> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @AllowNull(false)
  @ForeignKey(() => Page)
  @Column(DataType.INTEGER)
  public pageId: number;

  @BelongsTo(() => Page)
  public page?: Page;

  @AllowNull(false)
  @Column(DataType.STRING)
  public name: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public type: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  public content?: Record<string, unknown> | null;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  public order: number;
}
