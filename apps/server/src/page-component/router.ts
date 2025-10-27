// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { wss } from '@ay-nestjs/share-server';
import express from 'express';
import { PageComponentController } from './page-component.controller';

export function loadPageComponent() {
  wss.on({
    path: '/ws/page-component/getComponentList',
    controller: PageComponentController,
    method: 'getComponentList',
    rules: [],
  });

  wss.on({
    path: '/ws/page-component/getComponentDetail',
    controller: PageComponentController,
    method: 'getComponentDetail',
    rules: [
      {
        name: 'id',
        type: 'number',
        required: true,
      },
    ],
  });

  wss.on({
    path: '/ws/page-component/createComponent',
    controller: PageComponentController,
    method: 'createComponent',
    rules: [
      {
        name: 'session',
        type: 'SessionDto',
        required: true,
        decorators: ['@Session()'],
      },
      {
        name: 'payload',
        type: 'CreatePageComponentDto',
        required: true,
      },
    ],
  });

  wss.on({
    path: '/ws/page-component/updateComponent',
    controller: PageComponentController,
    method: 'updateComponent',
    rules: [
      {
        name: 'session',
        type: 'SessionDto',
        required: true,
        decorators: ['@Session()'],
      },
      {
        name: 'payload',
        type: 'UpdatePageComponentDto',
        required: true,
      },
    ],
  });
}
// acc146f95211696274d0fe6c682b0bfa62abcc106c21d67106b366e0ae1bce8a
