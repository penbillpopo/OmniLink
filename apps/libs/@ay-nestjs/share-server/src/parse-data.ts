import { falsy } from "libs/@ay/util/src";

export function parseData(
  field: string,
  data: any,
  type: any,
  required: boolean,
) {
  if (data === null || data === undefined) {
    if (required) {
      throw field + ' 為必填項目';
    }
    return undefined;
  }

  try {
    if (typeof data === 'string') {
      data = decodeURIComponent(data);
    }
  } catch (e) {}

  try {
    switch (type) {
      case 'string':
        return data.toString();

      case 'string[]':
        if (data instanceof Array) {
          return data.map((row) => row.toString());
        } else {
          return [data.toString()];
        }

      case 'number':
        return parseInt(data);

      case 'number[]':
        if (data instanceof Array) {
          return data.map((row) => parseInt(row));
        } else {
          return [parseInt(data)];
        }

      case 'boolean':
        return falsy(data);

      default:
        try {
          data = JSON.parse(data);
        } catch (e) {}
        return data;
    }
  } catch (e) {
    throw field + '資料解析失敗(' + data + ')';
  }
}
