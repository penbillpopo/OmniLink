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
// c27e89af527957d72f34ff243bfee9be174ee8f608c183a780ccba9564663c24
