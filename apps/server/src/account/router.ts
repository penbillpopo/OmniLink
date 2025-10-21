// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { wss } from '@ay-nestjs/share-server';
import express from 'express';
import { AccountController } from './account.controller';

export function loadAccount() {
  wss.on({
    path: '/ws/account/login',
    controller: AccountController,
    method: 'login',
    rules: [
      {
        name: 'session',
        type: 'SessionDto',
        required: true,
        decorators: ['@Session()'],
      },
      {
        name: 'account',
        type: 'string',
        required: true,
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        decorators: ['@Password()'],
      },
    ],
  });

  wss.on({
    path: '/ws/account/loginViaToken',
    controller: AccountController,
    method: 'loginViaToken',
    rules: [
      {
        name: 'session',
        type: 'SessionDto',
        required: true,
        decorators: ['@Session()'],
      },
      {
        name: 'token',
        type: 'string',
        required: true,
      },
    ],
  });

  wss.on({
    path: '/ws/account/register',
    controller: AccountController,
    method: 'register',
    rules: [
      {
        name: 'name',
        type: 'string',
        required: true,
      },
      {
        name: 'account',
        type: 'string',
        required: true,
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        decorators: ['@Password()'],
      },
      {
        name: 'roleId',
        type: 'number',
        required: false,
      },
      {
        name: 'status',
        type: "'active' | 'inactive' | 'suspended'",
        required: false,
      },
    ],
  });

  wss.on({
    path: '/ws/account/isLoggedIn',
    controller: AccountController,
    method: 'isLoggedIn',
    rules: [
      {
        name: 'session',
        type: 'SessionDto',
        required: true,
        decorators: ['@Session()'],
      },
    ],
  });

  wss.on({
    path: '/ws/account/logout',
    controller: AccountController,
    method: 'logout',
    rules: [
      {
        name: 'session',
        type: 'SessionDto',
        required: true,
        decorators: ['@Session()'],
      },
    ],
  });

  wss.on({
    path: '/ws/account/getAccountList',
    controller: AccountController,
    method: 'getAccountList',
    rules: [
      {
        name: 'searchDto',
        type: 'SearchDto',
        required: true,
      },
    ],
  });

  wss.on({
    path: '/ws/account/updateAccount',
    controller: AccountController,
    method: 'updateAccount',
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
        name: 'account',
        type: 'string',
        required: true,
      },
      {
        name: 'password',
        type: 'string',
        required: false,
      },
      {
        name: 'roleId',
        type: 'number | null',
        required: false,
      },
      {
        name: 'status',
        type: "'active' | 'inactive' | 'suspended'",
        required: false,
      },
    ],
  });

  wss.on({
    path: '/ws/account/deleteAccount',
    controller: AccountController,
    method: 'deleteAccount',
    rules: [
      {
        name: 'id',
        type: 'number',
        required: true,
      },
    ],
  });
}
// b6201652e7a75f9c74497f63bf851d78bfc648ed0a140e197d90945fb7283c4d
