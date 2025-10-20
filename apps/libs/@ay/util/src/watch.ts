import { Observer } from 'rxjs';

export type WatchChangeType = 'UPDATE' | 'INSERT' | 'DELETE';
export interface WatchChangeInfo {
  /** ex: ["mainKey", "subKey", "wtf"] */
  path: string[];
  newValue?: any;
  oldValue?: any;
  type: WatchChangeType;
}
// deep proxy
// 每次的改變都要通知
// 每一次的改變都是以最根節點改變通知

// const _DEBUG_FLAG = false;
// const //debugLog = (...args) => {
//   if (_DEBUG_FLAG) console.log(...args);
// }

export function watch(
  value: any,
  initPath: string[],
  obs: Observer<WatchChangeInfo>,
  deleteDeepWatch = false,
) {
  for (const prop in value) {
    if (value[prop] instanceof Object) {
      const _path = initPath.concat(prop);
      value[prop] = watch(value[prop], _path, obs, deleteDeepWatch);
    }
  }
  return new Proxy(value, handler(initPath, obs, deleteDeepWatch));
}

function handler(
  parentPath: string[],
  obs: Observer<WatchChangeInfo>,
  deleteDeepWatch = false,
) {
  return {
    set: (target: any, property: string, newValue: any) => {
      const recursiveSet = (
        target: any,
        property: string,
        newValue: any,
        inRecursive = false,
        parentPath: string[],
      ) => {
        const path = parentPath.concat(property);
        //debugLog('newValue', newValue);
        if (newValue instanceof Object) {
          newValue = JSON.parse(JSON.stringify(newValue));
          //debugLog('newValue is Object');
          if (target[property] instanceof Object) {
            //debugLog('target[property] is Object');
            const src = Object.keys(target[property]);
            const dest = Object.keys(newValue);
            //debugLog('src', src);
            //debugLog('dest', dest);
            // 寫入或更新原本的欄位
            for (const subProperty of dest) {
              //debugLog('U I subProperty', subProperty);
              const idx = src.indexOf(subProperty);
              if (idx !== -1) src.splice(idx, 1); // 如果有在原本的欄位內，清除原本的欄位（稍後用來清除沒用到的欄位）
              recursiveSet(
                target[property],
                subProperty,
                newValue[subProperty],
                true,
                path,
              );
            }
            //debugLog(src, "deleteDeepWatch", deleteDeepWatch)
            // 刪除舊的沒用到的欄位
            for (const subProperty of src) {
              let oldValue = target[property][subProperty];
              if (deleteDeepWatch) {
                oldValue = JSON.parse(
                  JSON.stringify(target[property][subProperty]),
                );
                if (target[property][subProperty] instanceof Object) {
                  recursiveSet(target[property], subProperty, {}, true, path);
                }
              }
              obs.next({
                path: path.concat(subProperty),
                oldValue,
                type: 'DELETE',
              });
              delete target[property][subProperty];
            }
          } else {
            //debugLog('target[property] is not Object');
            //debugLog('create watch', path);
            target[property] = watch({}, path, obs, deleteDeepWatch);
            const dest = Object.keys(newValue);
            //debugLog('dest', dest);
            //debugLog('wtf', 'target', target, 'property', property, 'target[property]', target[property]);
            //debugLog('newValue', newValue)
            dest.map((prop) => {
              //debugLog('prop', prop);
              return recursiveSet(
                target[property],
                prop,
                newValue[prop],
                true,
                path,
              );
            });
          }
        } else {
          //debugLog('newValue is not Object');
          const oldValue = target[property];
          //debugLog('oldValue', oldValue);
          //debugLog('inRecursive', inRecursive);
          //debugLog('target', target, 'property', property);
          if (newValue === undefined) {
            // 刪除
            if (deleteDeepWatch) {
              // console.log(target, property, target[property])
              if (target[property] instanceof Object) {
                for (const subProperty in target[property]) {
                  recursiveSet(
                    target[property],
                    subProperty,
                    undefined,
                    true,
                    path,
                  );
                }
              } else {
                target[property] = undefined;
                if (!inRecursive) {
                  obs.next({ path: path, oldValue, type: 'DELETE' });
                }
              }
            } else {
              target[property] = undefined;
              if (!inRecursive) {
                obs.next({ path: path, oldValue, type: 'DELETE' });
              }
            }
          } else if (inRecursive) {
            //debugLog('setvalue', 'target', target);
            target[property] = newValue;
            //debugLog('set value', 'target', target);
          } else if (oldValue === undefined) {
            obs.next({ path, newValue, type: 'INSERT' });
          } else if (newValue !== oldValue) {
            obs.next({ path, newValue, oldValue, type: 'UPDATE' });
          }
          if (!inRecursive) {
            //debugLog('inRecursive false set value');
            target[property] = newValue;
          }
          //debugLog('target', target, 'property', property);
        }
      };
      recursiveSet(target, property, newValue, false, parentPath);
      return true;
    },
    get: (target, prop) => {
      return target[prop];
    },
  };
}
