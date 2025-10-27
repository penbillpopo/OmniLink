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
import { PageComponentField } from './page-component-field';

@Table({
  tableName: 'page_components',
  paranoid: false,
})
export class PageComponent extends TimeStamps<PageComponent> {
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

  @HasMany(() => PageComponentField, { onDelete: 'CASCADE' })
  public fields?: PageComponentField[];
}
