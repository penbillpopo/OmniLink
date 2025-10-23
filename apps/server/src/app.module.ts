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
import { LoginLogController } from './login-log/login-log.controller';
import { LoginLogService } from './login-log/login-log.service';
import { PageController } from './page/page.controller';
import { PageService } from './page/page.service';
import { PagePublicController } from './public/page-public.controller';
import { UploadController } from './public/upload.controller';

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
    LoginLogController,
    PageController,
    PagePublicController,
    UploadController,
    StatusController,
  ],
  providers: [
    AppService,
    AccountService,
    AccountHelperService,
    AuditService,
    LoginLogService,
    PageService,
    RoleService,
    Provider.str('SERVER_JWT_KEY'),
    Provider.str('AES_ENCODE_KEY'),
    Provider.str('TRADE_SERVICE_URL'),
  ],
})
export class AppModule {}
