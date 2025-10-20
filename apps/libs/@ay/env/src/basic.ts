import { environmentStore } from './store';

const isBrowser = typeof process === 'undefined';

if (!isBrowser) {
  /* eslint @typescript-eslint/no-var-requires: 0 */
  const fs = require('fs');
  const { resolve } = require('path');
  const dotenv = require('dotenv');
  const override = true;
  const parent = calcDirParent();

  loadDotEnv('.env');

  if (
    process.argv.includes('jest') ||
    process.env['JEST_WORKER_ID'] !== undefined
  ) {
    loadDotEnv('jest.env');
  }

  if (process.env['CI'] === 'true') {
    loadDotEnv('ci.env');
  }

  function calcDirParent() {
    const folders = __dirname.split('/');
    const index = folders.indexOf('dist');
    if (index > -1) {
      return '../'.repeat(folders.length - index);
    } else {
      return '../../../../';
    }
  }

  function loadDotEnv(filename: string) {
    const path = resolve(__dirname, parent, filename);
    if (fs.existsSync(path)) {
      dotenv.config({ path, override });
    }
  }
}

declare global {
  interface Window {
    env: { [key: string]: string };
  }
}

function readEnvironment(key: string): string {
  if (isBrowser) {
    return window?.env?.[key] || undefined;
  } else {
    return process?.env?.[key] || undefined;
  }
}

export function int(
  key: string,
  defaultValue?: number,
  isRequired = true,
): number {
  environmentStore.add(key, defaultValue, '數字');
  const value = readEnvironment(key);

  if (!value) {
    if (isRequired && defaultValue === undefined) {
      throw new Error(`沒有設定環境變數 '${key}'`);
    }

    return defaultValue;
  }

  const intValue = parseInt(value, 10);
  if (isNaN(intValue)) {
    throw new Error(`環境變數 '${key}' 需要一個數字，但目前設定為 ${value}`);
  }

  return intValue;
}

export function str(
  key: string,
  defaultValue: string = undefined,
  isRequired = true,
): string {
  environmentStore.add(key, defaultValue, '字串');
  const value = readEnvironment(key);

  if (!value) {
    if (isRequired && defaultValue === undefined) {
      throw new Error(`沒有設定環境變數 '${key}'`);
    }

    return defaultValue;
  }

  return value.toString();
}

export function strs(
  key: string,
  defaultValue?: string[],
  isRequired = true,
): string[] {
  environmentStore.add(key, defaultValue, '字串陣列');
  const value = readEnvironment(key);

  if (!value) {
    if (isRequired && defaultValue === undefined) {
      throw new Error(`沒有設定環境變數 '${key}'`);
    }

    return defaultValue;
  }

  return value
    .toString()
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ints(
  key: string,
  defaultValue?: number[],
  isRequired = true,
): number[] {
  environmentStore.add(key, defaultValue, '數字陣列');
  const value = readEnvironment(key);

  if (!value) {
    if (isRequired && defaultValue === undefined) {
      throw new Error(`沒有設定環境變數 '${key}'`);
    }

    return defaultValue;
  }

  return value
    .toString()
    .split(',')
    .map((value) => {
      const intValue = parseInt(value, 10);
      if (isNaN(intValue)) {
        throw new Error(`環境變數 '${key}' 需要數字陣列，但其中包含 ${value}`);
      }
      return intValue;
    });
}

export function bool(
  key: string,
  defaultValue?: boolean,
  isRequired = true,
): boolean {
  environmentStore.add(key, defaultValue, '布林值');
  const value = readEnvironment(key);

  if (!value) {
    if (isRequired && defaultValue === undefined) {
      throw new Error(`沒有設定環境變數 '${key}'`);
    }

    return defaultValue;
  }

  if (['YES', '1', 'TRUE', 'ON', 'Y', 'O', 'T'].includes(value.toUpperCase())) {
    return true;
  } else if (
    ['NO', '0', 'FALSE', 'OFF', 'N', 'X', 'F'].includes(value.toUpperCase())
  ) {
    return false;
  } else {
    throw new Error(`環境變數 '${key}' 需要布林值，但收到 ${value}`);
  }
}

export function json(key: string, defaultValue?: any, isRequired = true): any {
  environmentStore.add(key, defaultValue, 'JSON');
  const value = readEnvironment(key);

  if (!value) {
    if (isRequired && defaultValue === undefined) {
      throw new Error(`沒有設定環境變數 '${key}'`);
    }

    return defaultValue;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`環境變數 '${key}' 無法正確以 JSON 解析`);
  }
}

export function array(
  key: string,
  defaultValue?: any[],
  isRequired = true,
): string[] {
  const array = [];

  let index = 1;
  do {
    const value = str(`${key}_${index}`, '');
    if (value === '') {
      break;
    }

    array.push(value);
    index++;
  } while (1);

  if (array.length === 0) {
    if (isRequired && defaultValue === undefined) {
      throw new Error(`沒有設定環境變數 '${key}'`);
    }

    return defaultValue;
  }

  return array;
}
