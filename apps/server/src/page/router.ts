// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { wss } from '@ay-nestjs/share-server';
import express from 'express';
import { PageController } from './page.controller';

export function loadPage() {
  wss.on({
    path: '/ws/page/getPageList',
    controller: PageController,
    method: 'getPageList',
    rules: [],
  });

  wss.on({
    path: '/ws/page/getPageDetail',
    controller: PageController,
    method: 'getPageDetail',
    rules: [
      {
        name: 'id',
        type: 'number',
        required: true,
      },
    ],
  });

  wss.on({
    path: '/ws/page/createPage',
    controller: PageController,
    method: 'createPage',
    rules: [
      {
        name: 'session',
        type: 'SessionDto',
        required: true,
        decorators: ['@Session()'],
      },
      {
        name: 'payload',
        type: 'CreatePageDto',
        required: true,
      },
    ],
  });

  wss.on({
    path: '/ws/page/createPageBlock',
    controller: PageController,
    method: 'createPageBlock',
    rules: [
      {
        name: 'session',
        type: 'SessionDto',
        required: true,
        decorators: ['@Session()'],
      },
      {
        name: 'payload',
        type: 'CreatePageBlockDto',
        required: true,
      },
    ],
  });
}
// 4036e0aff3955e14fa24bce3dd5eef2a5bec09ce488eaf58e7852bc79bdd2385
