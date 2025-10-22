// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { wss } from '@ay-nestjs/share-server';
import express from 'express';
import { AuditController } from './audit.controller';

export function loadAudit() {
  wss.on({
    path: '/ws/audit/getRecentAuditLogs',
    controller: AuditController,
    method: 'getRecentAuditLogs',
    rules: [
      {
        name: 'limit',
        type: 'number',
        required: false,
      },
      {
        name: 'filter',
        type: 'AuditLogFilterDto',
        required: false,
      },
    ],
  });

  wss.on({
    path: '/ws/audit/getAuditList',
    controller: AuditController,
    method: 'getAuditList',
    rules: [
      {
        name: 'searchDto',
        type: 'SearchDto',
        required: true,
      },
      {
        name: 'filter',
        type: 'AuditLogFilterDto',
        required: false,
      },
    ],
  });

  wss.on({
    path: '/ws/audit/createAuditLog',
    controller: AuditController,
    method: 'createAuditLog',
    rules: [
      {
        name: 'session',
        type: 'SessionDto',
        required: true,
        decorators: ['@Session()'],
      },
      {
        name: 'payload',
        type: 'CreateAuditLogDto',
        required: true,
      },
    ],
  });
}
// 7a5fb27f041196d41115fb945f7f6261e188b3600b4b618551ef3fee900a8318
