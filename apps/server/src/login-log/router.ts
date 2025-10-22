// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { wss } from '@ay-nestjs/share-server';
import express from 'express';
import { LoginLogController } from './login-log.controller';

export function loadLoginLog() {
  wss.on({
    path: '/ws/login-log/getLoginLogList',
    controller: LoginLogController,
    method: 'getLoginLogList',
    rules: [
      {
        name: 'searchDto',
        type: 'SearchDto',
        required: true,
      },
      {
        name: 'filter',
        type: 'LoginLogFilterDto',
        required: false,
      },
    ],
  });

  wss.on({
    path: '/ws/login-log/getRecentLoginLogs',
    controller: LoginLogController,
    method: 'getRecentLoginLogs',
    rules: [
      {
        name: 'limit',
        type: 'number',
        required: false,
      },
      {
        name: 'filter',
        type: 'LoginLogFilterDto',
        required: false,
      },
    ],
  });
}
// d21829a03f969c7365ab959688fb68a5434abe39e9c67c30452731bac4b310a6
