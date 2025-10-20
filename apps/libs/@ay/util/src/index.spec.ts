import { Subject } from 'rxjs';
import {
  debounce,
  defaults,
  falsy,
  inArray,
  isEqual,
  log,
  safeCallback,
  toObserver,
  values,
} from './index';

describe('util', () => {
  it('defaults', () => {
    expect(defaults(null, 'A')).toEqual('A');
    expect(defaults('A', 'B')).toEqual('A');
  });

  it('safeCallback', () => {
    const fn = () => 'success';
    expect(safeCallback(fn)()).toEqual('success');
    safeCallback(null)(); // 可以正常運作
  });

  it('inArray', () => {
    expect(inArray(1, [1, 2, 3, 4])).toEqual(true);
    expect(inArray(5, [1, 2, 3, 4])).toEqual(false);
  });

  it('toObserver', () => {
    toObserver(1).subscribe((n) => expect(n).toEqual(1));
    const promise = new Promise((resolve, reject) => resolve(14));
    toObserver(promise).subscribe((n) => expect(n).toEqual(14));
    const observer = new Subject();
    observer.next('success');
    toObserver(observer).subscribe((n) => expect(n).toEqual('success'));
    const fn = (arg) => arg;
    toObserver(fn, 1).subscribe((n) => expect(n).toEqual(1));
    toObserver(fn, promise).subscribe((n) => expect(n).toEqual(14));
    toObserver(fn, observer).subscribe((n) => expect(n).toEqual('success'));
  });

  it('falsy', () => {
    expect(falsy('false')).toEqual(false);
    expect(falsy('null')).toEqual(false);
    expect(falsy('undefined')).toEqual(false);
    expect(falsy('0')).toEqual(false);
    expect(falsy('NaN')).toEqual(false);
    expect(falsy(undefined)).toEqual(false);
    expect(falsy(null)).toEqual(false);
    expect(falsy(false)).toEqual(false);
    expect(falsy(null)).toEqual(false);
    expect(falsy(0)).toEqual(false);
    expect(falsy(NaN)).toEqual(false);
  });

  describe('values', () => {
    it('values', () => {
      const obj = {
        A: { score: 90 },
        B: { score: 80 },
        C: { score: 70 },
      };
      const arr = values(obj);
      expect(arr.length).toEqual(3);
      expect(arr[0]['key']).toEqual('A');
    });

    it('values', () => {
      const obj = {
        A: { score: 90 },
        B: { score: 80 },
        C: { score: 70 },
      };
      const arr = values(obj, false);
      expect(arr.length).toEqual(3);
      expect(arr[0]['key']).toBeUndefined();
    });
  });

  it('log decorator', (done) => {
    const proxy = console.log;

    console.log = (...args) => {
      console.log = proxy;
      expect(args[0]).toMatch(/^Calc\.addTo\(0,10\) = 55 \(\d+\ms\)$/);
      done();
    };

    class Calc {
      @log
      public static addTo(from: number, to: number) {
        let sum = 0;
        for (let i = from; i <= to; i++) sum += i;
        return sum;
      }
    }

    Calc.addTo(0, 10);
  });

  describe('debounce decorator', () => {
    class DebounceCalc {
      @debounce()
      public static addTo(from: number, to: number) {
        if (to < from) throw "'to' less then 'from'";
        let sum = 0;
        for (let i = from; i <= to; i++) {
          sum += i;
        }
        return sum;
      }
    }

    it('正常運作', (done) => {
      const start = Date.now();
      let t = 0;
      const interval = setInterval(() => {
        (DebounceCalc.addTo(0, 100) as any).then((e) => {
          const end = Date.now();
          const spend = end - start;
          expect(spend).toBeGreaterThan(100);
          done();
        });
        t++;
        if (t > 10) clearInterval(interval);
      }, 10);
    });

    it('執行過程發生錯誤', (done) => {
      let t = 0;
      const interval = setInterval(() => {
        const p = DebounceCalc.addTo(0, -100) as any as Promise<any>;
        p.then((e) => done(false)).catch((e) => done());
        t++;
        if (t > 10) clearInterval(interval);
      });
    });
  });

  describe('isSame', () => {
    it('array完全一至', () =>
      expect(isEqual([1, 2, 3], [1, 2, 3], true)).toBe(true));
    it('array某個值不同', () =>
      expect(isEqual([1, 2, 3], [1, 2, 5], true)).toBe(false));
    it('array個數不同', () =>
      expect(isEqual([1, 2, 3], [1, 2], true)).toBe(false));
    it('物件陣列某個值不同', () =>
      expect(isEqual({ a: [1, 2, 3] }, { a: [1, 2, 5] }, true)).toBe(false));
    it('物件陣列相同', () =>
      expect(isEqual({ a: [1, 2, 3] }, { a: [1, 2, 3] }, true)).toBe(true));
  });
});
