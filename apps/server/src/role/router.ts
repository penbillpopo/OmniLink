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
      {
        name: 'accountIds',
        type: 'number[]',
        initializer: [],
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
        name: 'accountIds',
        type: 'number[]',
        required: false,
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
// f7a1e6ed7ef8b83131abbd1db6bae1dda74ce8cb8b39c5ea77d3baa7bfad1b65
