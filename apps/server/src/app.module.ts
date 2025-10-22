import { Models } from '@ay-gosu/sequelize-models';
import { SequelizeModule } from '@ay-nestjs/sequelize-provider';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { Provider } from 'libs/@ay/env/src';
import { AccountHelperService } from './account/account-helper.service';
import { AccountController } from './account/account.controller';
import { AccountService } from './account/account.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { StatusController } from './status/status.controller';
import { RoleController } from './role/role.controller';
import { RoleService } from './role/role.service';
import { AuditController } from './audit/audit.controller';
import { AuditService } from './audit/audit.service';

@Module({
  imports: [
    HttpModule,
    SequelizeModule.forRoot('GOSU', Models),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    AccountController,
    AuditController,
    RoleController,
    StatusController,
  ],
  providers: [
    AppService,
    AccountService,
    AccountHelperService,
    AuditService,
    RoleService,
    Provider.str('SERVER_JWT_KEY'),
    Provider.str('AES_ENCODE_KEY'),
    Provider.str('TRADE_SERVICE_URL'),
  ],
})
export class AppModule {}
