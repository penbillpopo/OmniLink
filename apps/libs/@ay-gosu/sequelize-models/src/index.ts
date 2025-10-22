import SequelizeHierarchy from '@ay/sequelize-hierarchy';
import { Sequelize } from 'sequelize';
import { ModelCtor } from 'sequelize-typescript';
import { Account } from './account';
import { Audit } from './audit';
import { Role } from './role';

export * from './account';
export * from './audit';
export * from './role';

export const Models: ModelCtor[] = [Role, Account, Audit];
SequelizeHierarchy(Sequelize);
