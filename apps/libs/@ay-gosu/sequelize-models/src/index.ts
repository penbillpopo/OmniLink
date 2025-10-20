import SequelizeHierarchy from '@ay/sequelize-hierarchy';
import { Sequelize } from 'sequelize';
import { ModelCtor } from 'sequelize-typescript';
import { Account } from './account';

export * from './account';

export const Models: ModelCtor[] = [Account];
SequelizeHierarchy(Sequelize);
