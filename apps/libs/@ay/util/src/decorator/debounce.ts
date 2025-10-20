import { isEqual } from '../isEqual';

type Cache = {
  params: any[];
  timeout?: any; // 前端沒有 NodeJS.Timer
};

export function debounce(
  wait = 300,
  deep = false,
): (
  target: any,
  key: PropertyKey,
  descriptor: PropertyDescriptor,
) => PropertyDescriptor {
  return function decorator(
    target: any,
    key: PropertyKey,
    descriptor: PropertyDescriptor,
  ) {
    const caches: Cache[] = [];
    const originFn = descriptor.value;
    descriptor.value = function (...params) {
      let cache = caches.find((cache) => isEqual(cache.params, params, deep));
      if (cache === undefined) {
        cache = { params };
        caches.push(cache);
      }
      return new Promise((resolve, reject) => {
        if (cache.timeout) clearTimeout(cache.timeout);
        cache.timeout = setTimeout(() => {
          cache.timeout = null;
          try {
            resolve(originFn.apply(this, [...params]));
          } catch (e) {
            reject(e);
          }
        }, wait);
      });
    };
    return descriptor;
  };
}
