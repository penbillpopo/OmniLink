import { addAttributeOptions } from 'sequelize-typescript';

export const Unique = (key: string) => (target, propertyName) =>
  addAttributeOptions(target, propertyName, { unique: key ? key : true });

export const Hierarchy = (options) => (target, propertyName) =>
  addAttributeOptions(target, propertyName, {
    hierarchy: options ? options : true,
  } as any);
