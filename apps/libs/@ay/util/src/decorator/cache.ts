import { defaults } from '../defaults';
import { isEqual } from '../isEqual';

type Cache = {
  params: any[];
  result?: any;
};

/**
 * 執行函式的結果會快取，當N豪秒內又執行此函數且參數一致時會直接返回上次計算的結果
 * @param {Function} cacheFn 快取函數
 * @param {number} wait 快取時間(毫秒)(預設3000ms)
 * @param {boolean} deep 檢查參數時是否深度檢查(預設不深度檢查)
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function cache(cacheFn: Function, wait: number, deep: boolean);
/**
 * 執行函式的結果會快取，當N豪秒內又執行此函數且參數一致時會直接返回上次計算的結果
 * @param {Function} cacheFn 快取函數
 * @param {number} wait 快取時間(毫秒)(預設3000ms)
 * @param {boolean} deep 檢查參數時是否深度檢查(預設不檢查)
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function cache(cacheFn: Function, wait: number);
/**
 * 執行函式的結果會快取，當N豪秒內又執行此函數且參數一致時會直接返回上次計算的結果
 * @param {Function} cacheFn 快取函數
 * @param {number} wait 快取時間(毫秒)(預設3000ms)
 * @param {boolean} deep 檢查參數時是否深度檢查(預設不檢查)
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function cache(cacheFn: Function);
/**
 * [Function Decorator]
 * 執行函式的結果會快取，當N豪秒內又執行此函數且參數一致時會直接返回上次計算的結果
 * @param {number} wait 快取時間(毫秒)(預設3000ms)
 * @param {boolean} deep 檢查參數時是否深度檢查(預設不檢查)
 */
export function cache(wait: number, deep: boolean);
/**
 * [Function Decorator]
 * 執行函式的結果會快取，當N豪秒內又執行此函數且參數一致時會直接返回上次計算的結果
 * @param {number} wait 快取時間(毫秒)(預設3000ms)
 * @param {boolean} deep 檢查參數時是否深度檢查(預設不檢查)
 */
export function cache(wait: number);
/**
 * [Function Decorator]
 * 執行函式的結果會快取，當N豪秒內又執行此函數且參數一致時會直接返回上次計算的結果
 * @param {number} wait 快取時間(毫秒)(預設3000ms)
 * @param {boolean} deep 檢查參數時是否深度檢查(預設不檢查)
 */
export function cache(): any;
export function cache(...args: any[]): any {
  // eslint-disable-next-line @typescript-eslint/ban-types
  let func: Function;
  let wait: number;
  let deep: boolean;
  let caches: any[];

  const cacheFunc = function (...params) {
    let cache = caches.find((cache) => isEqual(cache.params, params, deep));
    if (cache) return cache.result;
    const result = func.apply(this, [...params]);
    cache = { params, result };
    caches.push(cache);
    setTimeout(() => {
      const idx = caches.indexOf(cache);
      caches.splice(idx, 1);
    }, wait);
    return result;
  };

  if (args[0] instanceof Function) {
    func = args[0];
    wait = defaults(args[1], 3000);
    deep = defaults(args[2], false);
    if (cacheMap[func.name] === undefined) cacheMap[func.name] = [];
    caches = cacheMap[func.name];
    return cacheFunc;
  } else {
    wait = defaults(args[0], 3000);
    deep = defaults(args[1], false);

    return function decorator(
      target: any,
      key: PropertyKey,
      descriptor: PropertyDescriptor,
    ) {
      func = descriptor.value;
      if (cacheMap[key.toString()] === undefined) {
        cacheMap[key.toString()] = [];
      }
      caches = cacheMap[key.toString()];
      descriptor.value = cacheFunc;
      return descriptor;
    };
  }
}

const cacheMap: {
  [key: string]: Cache[];
} = {};
