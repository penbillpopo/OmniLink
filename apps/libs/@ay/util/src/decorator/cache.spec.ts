import { cache } from './cache';

describe('cache', () => {
  class CacheCalc {
    public count = 0;

    @cache(10)
    public addTo(from: number, to: number) {
      let sum = 0;
      for (let i = from; i <= to; i++) {
        sum += i;
        this.count++;
      }
      return sum;
    }
  }

  it(`快取時間內取用快取資料`, () => {
    const calc = new CacheCalc();
    expect(calc.addTo(1, 10)).toBe(55);
    expect(calc.count).toBe(10);
    expect(calc.addTo(1, 10)).toBe(55);
    expect(calc.count).toBe(10);
  });

  it('不同的參數不會採用相同的結果', () => {
    const calc = new CacheCalc();
    expect(calc.addTo(11, 20)).toBe(155);
    expect(calc.addTo(11, 21)).toBe(176);
    expect(calc.count).toBe(21);
  });

  it('快取在指定時間內會清除', (done) => {
    const calc = new CacheCalc();
    expect(calc.addTo(21, 30)).toBe(255);
    setTimeout((e) => {
      expect(calc.addTo(21, 30)).toBe(255);
      expect(calc.count).toBe(20);
      done();
    }, 30);
  });

  it('可以直接套用在執行函數時', () => {
    let cnt = 0;
    function fn() {
      cnt++;
    }
    cache(fn, 3000)();
    cache(fn, 3000)();
    cache(fn, 3000)();
    expect(cnt).toBe(1);
  });
});
