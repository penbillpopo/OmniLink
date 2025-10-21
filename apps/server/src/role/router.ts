// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { wss } from '@ay-nestjs/share-server';
import express from 'express';
import { RoleController } from './role.controller';

export function loadRole() {
  wss.on({
    path: '/ws/role/getRoleList',
    controller: RoleController,
    method: 'getRoleList',
    rules: [
      {
        name: 'searchDto',
        type: 'SearchDto',
        required: true,
      },
    ],
  });

  wss.on({
    path: '/ws/role/getRoleDetail',
    controller: RoleController,
    method: 'getRoleDetail',
    rules: [
      {
        name: 'id',
        type: 'number',
        required: true,
      },
    ],
  });

  wss.on({
    path: '/ws/role/createRole',
    controller: RoleController,
    method: 'createRole',
    rules: [
      {
        name: 'name',
        type: 'string',
        required: true,
      },
      {
        name: 'permissions',
        type: 'string[]',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        required: false,
      },
    ],
  });

  wss.on({
    path: '/ws/role/updateRole',
    controller: RoleController,
    method: 'updateRole',
    rules: [
      {
        name: 'id',
        type: 'number',
        required: true,
      },
      {
        name: 'name',
        type: 'string',
        required: true,
      },
      {
        name: 'permissions',
        type: 'string[]',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        required: false,
      },
      {
        name: 'order',
        type: 'number',
        required: false,
      },
    ],
  });

  wss.on({
    path: '/ws/role/reorderRoles',
    controller: RoleController,
    method: 'reorderRoles',
    rules: [
      {
        name: 'orders',
        type: 'any',
        required: true,
      },
    ],
  });

  wss.on({
    path: '/ws/role/deleteRole',
    controller: RoleController,
    method: 'deleteRole',
    rules: [
      {
        name: 'id',
        type: 'number',
        required: true,
      },
    ],
  });
}
