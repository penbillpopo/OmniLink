import { CodeErrorGenerate as _ } from '@ay/util';

export const Errors = {
  ACCOUNT_EXIST: _('帳號已經存在'),
  ACCOUNT_NOT_FOUND: _('查無此帳號'),
  CREATE_FAILED: _((reason = '創建失敗') => reason),
  DELETE_FAILED: _((reason = '刪除失敗') => reason),
  UPDATE_FAILED: _((reason = '更新失敗') => reason),
  WRONG_PASSWORD: _('密碼錯誤'),
  ROLE_EXIST: _('角色已經存在'),
  ROLE_NOT_FOUND: _('查無此角色'),
  PAGE_EXIST: _('頁面已存在'),
  PAGE_NOT_FOUND: _('查無此頁面'),
  PAGE_BLOCK_NOT_FOUND: _('查無此頁面區塊'),
  INVALID_BLOCK_TYPE: _('無效的區塊類型'),
};

Object.keys(Errors).map((key) => (Errors[key].code = key));

export type FieldValidationField = {
  field: string;
  type: string;
  message: string;
};
