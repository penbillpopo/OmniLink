import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';

export class TimeStamps<T> extends Model<Partial<T>> {
  @CreatedAt
  @AllowNull(false)
  @Column(DataType.DATE)
  public createdAt: Date;

  @UpdatedAt
  @AllowNull(false)
  @Column(DataType.DATE)
  public updatedAt: Date;

  @DeletedAt
  @AllowNull(true)
  @Default(null)
  @Column(DataType.DATE)
  public deletedAt: Date;
}
