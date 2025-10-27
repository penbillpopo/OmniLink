import SequelizeHierarchy from '@ay/sequelize-hierarchy';
import { Sequelize } from 'sequelize';
import { ModelCtor } from 'sequelize-typescript';
import { Account } from './account';
import { Audit } from './audit';
import { Role } from './role';
import { LoginLog } from './login-log';
import { Page } from './page';
import { PageBlock } from './page-block';
import { PageComponent } from './page-component';
import { PageComponentField } from './page-component-field';

export * from './account';
export * from './audit';
export * from './role';
export * from './login-log';
export * from './page';
export * from './page-block';
export * from './page-component';
export * from './page-component-field';

export const Models: ModelCtor[] = [
  Role,
  Account,
  Audit,
  LoginLog,
  Page,
  PageBlock,
  PageComponent,
  PageComponentField,
];
SequelizeHierarchy(Sequelize);
