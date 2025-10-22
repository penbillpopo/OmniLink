import SequelizeHierarchy from '@ay/sequelize-hierarchy';
import { Sequelize } from 'sequelize';
import { ModelCtor } from 'sequelize-typescript';
import { Account } from './account';
import { Audit } from './audit';
import { Role } from './role';
import { LoginLog } from './login-log';

export * from './account';
export * from './audit';
export * from './role';
export * from './login-log';

export const Models: ModelCtor[] = [Role, Account, Audit, LoginLog];
SequelizeHierarchy(Sequelize);
