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
import { TimeStamps } from './timestamps';
import { PageComponent } from './page-component';

@Table({
  tableName: 'page_component_fields',
  paranoid: false,
})
export class PageComponentField extends TimeStamps<PageComponentField> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @AllowNull(false)
  @ForeignKey(() => PageComponent)
  @Column(DataType.INTEGER)
  public componentId: number;

  @BelongsTo(() => PageComponent)
  public component?: PageComponent;

  @AllowNull(false)
  @Column(DataType.STRING)
  public key: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public type: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public property?: string | null;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  public order: number;
}
