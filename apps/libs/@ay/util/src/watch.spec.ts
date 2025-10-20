import { Subject } from 'rxjs';
import { watch, WatchChangeInfo } from './watch';

describe('watch', () => {
  it('watch empty object build deleteDeepWatch', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({}, ['proxy'], subject, true);
    expect(proxy).toBeDefined();
    callback();
  });

  it('watch empty object build not deleteDeepWatch', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({}, ['proxy'], subject, false);
    expect(proxy).toBeDefined();
    callback();
  });

  it('watch empty object build not deleteDeepWatch2', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({}, ['proxy'], subject);
    expect(proxy).toBeDefined();
    callback();
  });

  it('watch object build deleteDeepWatch', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({ apple: 45, water: 20 }, ['proxy'], subject, true);
    expect(proxy).toBeDefined();
    callback();
  });

  it('watch object build not deleteDeepWatch', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({ apple: 45, water: 20 }, ['proxy'], subject, false);
    expect(proxy).toBeDefined();
    callback();
  });

  it('watch object build not deleteDeepWatch2', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({ apple: 45, water: 20 }, ['proxy'], subject);
    expect(proxy).toBeDefined();
    callback();
  });

  it('watch set value method', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({}, ['proxy'], subject, true);
    subject.subscribe((e) => {
      expect(e.path.join('.')).toBe('proxy.key');
      expect(e.type).toBe('INSERT');
      expect(e.newValue).toBe('value test');
      expect(e.oldValue).toBeUndefined();
      callback();
    });
    proxy.key = 'value test';
  });

  it('watch insert object method', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch(
      { price: { apple: { sell: 500 } } },
      ['proxy'],
      subject,
      true,
    );
    let step = 0;
    subject.subscribe((e) => {
      const path = e.path.join('.');
      switch (step) {
        case 0:
          expect(path).toBe('proxy.price.apple.buy');
          expect(e.type).toBe('INSERT');
          expect(e.newValue).toBe(45);
          step = 1;
          break;
        case 1:
          expect(path).toBe('proxy.price.apple.sell');
          expect(e.type).toBe('UPDATE');
          expect(e.newValue).toBe(22);
          step = 2;
          break;
        case 2:
          expect(path).toBe('proxy.price.water.buy');
          expect(e.type).toBe('INSERT');
          expect(e.newValue).toBe(20);
          step = 3;
          break;
        case 3:
          expect(path).toBe('proxy.price.water.sell');
          expect(e.type).toBe('INSERT');
          expect(e.newValue).toBe(10);
          callback();
          break;
      }
    });
    proxy.price = {
      apple: {
        buy: 45,
        sell: 22,
      },
      water: {
        buy: 20,
        sell: 10,
      },
    };
  });

  it('watch insert object method not deleteDeepWatch', (callback) => {
    //console.log('--- watch insert object method not deleteDeepWatch ---');
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch(
      { price: { apple: { sell: { wtf: 333 } } } },
      ['proxy'],
      subject,
      false,
    );
    let step = 0;
    subject.subscribe((e) => {
      const path = e.path.join('.');
      // console.log(e);
      switch (step) {
        case 0:
          expect(path).toBe('proxy.price.water.buy');
          expect(e.type).toBe('INSERT');
          expect(e.oldValue).toBeUndefined();
          expect(e.newValue).toBe(20);
          step = 1;
          break;
        case 1:
          expect(path).toBe('proxy.price.water.sell');
          expect(e.type).toBe('INSERT');
          expect(e.oldValue).toBeUndefined();
          expect(e.newValue).toBe(10);
          step = 2;
          break;
        case 2:
          expect(path).toBe('proxy.price.apple.buy');
          expect(e.type).toBe('INSERT');
          expect(e.oldValue).toBeUndefined();
          expect(e.newValue).toBe(300);
          step = 3;
          break;
        case 3:
          expect(path).toBe('proxy.price.apple.sell');
          expect(e.type).toBe('DELETE');
          expect(e.newValue).toBeUndefined();
          expect(e.oldValue.wtf).toBe(333);
          callback();
          break;
      }
    });
    proxy.price.water = {
      buy: 20,
      sell: 10,
    };
    proxy.price.apple = {
      buy: 300,
    };
  });

  it('watch insert object method deleteDeepWatch', (callback) => {
    //console.log('--- watch insert object method not deleteDeepWatch ---');
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch(
      { price: { apple: { sell: { wtf: 333 } } } },
      ['proxy'],
      subject,
      true,
    );
    let step = 0;
    subject.subscribe((e) => {
      const path = e.path.join('.');
      // console.log(e);
      switch (step) {
        case 0:
          expect(path).toBe('proxy.price.water.buy');
          expect(e.type).toBe('INSERT');
          expect(e.oldValue).toBeUndefined();
          expect(e.newValue).toBe(20);
          step = 1;
          break;
        case 1:
          expect(path).toBe('proxy.price.water.sell');
          expect(e.type).toBe('INSERT');
          expect(e.oldValue).toBeUndefined();
          expect(e.newValue).toBe(10);
          step = 2;
          break;
        case 2:
          expect(path).toBe('proxy.price.apple.buy');
          expect(e.type).toBe('INSERT');
          expect(e.oldValue).toBeUndefined();
          expect(e.newValue).toBe(300);
          step = 3;
          break;
        case 3:
          expect(path).toBe('proxy.price.apple.sell.wtf');
          expect(e.type).toBe('DELETE');
          expect(e.newValue).toBeUndefined();
          expect(e.oldValue).toBe(333);
          step = 4;
          break;
        case 4:
          expect(path).toBe('proxy.price.apple.sell');
          expect(e.type).toBe('DELETE');
          expect(e.newValue).toBeUndefined();
          expect(e.oldValue.wtf).toBe(333);
          callback();
          break;
      }
    });
    proxy.price.water = {
      buy: 20,
      sell: 10,
    };
    proxy.price.apple = {
      buy: 300,
    };
  });

  it('watch insert object method2', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({}, ['proxy'], subject, true);
    proxy.price = {
      apple: {
        buy: 45,
        sell: 22,
      },
      water: {
        buy: 20,
        sell: 10,
      },
    };
    let step = 0;
    subject.subscribe((e) => {
      const path = e.path.join('.');
      switch (step) {
        case 0:
          expect(path).toBe('proxy.price.apple.buy.wtf');
          expect(e.type).toBe('INSERT');
          expect(e.oldValue).toBeUndefined();
          expect(e.newValue).toBe(333);
          step = 1;
          break;
        case 1:
          expect(path).toBe('proxy.price.apple.buy.test');
          expect(e.type).toBe('INSERT');
          expect(e.oldValue).toBeUndefined();
          expect(e.newValue).toBe(321);
          callback();
          break;
      }
    });

    proxy.price.apple = {
      sell: 22,
      buy: {
        wtf: 333,
        test: 321,
      },
    };
  });

  it('watch update object method', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({}, ['proxy'], subject, true);
    proxy.price = {
      apple: {
        buy: 45,
        sell: 22,
      },
      water: {
        buy: 20,
        sell: 10,
      },
    };
    let step = 0;
    subject.subscribe((e) => {
      const path = e.path.join('.');
      // console.log(e);
      switch (step) {
        case 0:
          expect(path).toBe('proxy.price.apple.buy');
          expect(e.type).toBe('UPDATE');
          expect(e.oldValue).toBe(45);
          expect(e.newValue).toBe(321);
          step = 1;
          break;
        case 1:
          expect(path).toBe('proxy.price.water.buy');
          expect(e.type).toBe('UPDATE');
          expect(e.oldValue).toBe(20);
          expect(e.newValue).toBe(555);
          step = 2;
          break;
        case 2:
          expect(path).toBe('proxy.price.water.wtf');
          expect(e.type).toBe('INSERT');
          expect(e.oldValue).toBeUndefined();
          expect(e.newValue).toBe(123);
          step = 3;
          break;
        case 3:
          expect(path).toBe('proxy.price.water.sell');
          expect(e.type).toBe('DELETE');
          expect(e.newValue).toBeUndefined();
          expect(e.oldValue).toBe(10);
          callback();
          break;
      }
    });

    proxy.price = {
      apple: {
        sell: 22,
        buy: 321,
      },
      water: {
        buy: 555,
        wtf: 123,
      },
    };
  });

  it('watch delete object method deleteDeepWatch', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({}, ['proxy'], subject, true);
    proxy.price = {
      apple: {
        buy: 45,
        sell: 22,
      },
      water: {
        buy: 20,
        sell: 10,
      },
    };
    let step = 0;
    subject.subscribe((e) => {
      const path = e.path.join('.');
      switch (step) {
        case 0:
          expect(path).toBe('proxy.price.apple.buy');
          expect(e.type).toBe('DELETE');
          expect(e.oldValue).toBe(45);
          step = 1;
          break;
        case 1:
          expect(path).toBe('proxy.price.apple.sell');
          expect(e.type).toBe('DELETE');
          expect(e.oldValue).toBe(22);
          step = 2;
          break;
        case 2:
          expect(path).toBe('proxy.price.water.buy');
          expect(e.type).toBe('DELETE');
          expect(e.oldValue).toBe(20);
          step = 3;
          break;
        case 3:
          expect(path).toBe('proxy.price.water.sell');
          expect(e.type).toBe('DELETE');
          expect(e.oldValue).toBe(10);
          callback();
          break;
      }
    });
    proxy.price = undefined;
  });

  it('watch delete object method not deleteDeepWatch', (callback) => {
    const subject = new Subject<WatchChangeInfo>();
    const proxy = watch({}, ['proxy'], subject, false);
    proxy.price = {
      apple: {
        buy: 45,
        sell: 22,
      },
      water: {
        buy: 20,
        sell: 10,
      },
    };

    subject.subscribe((e) => {
      const path = e.path.join('.');
      expect(path).toBe('proxy.price');
      expect(e.type).toBe('DELETE');
      expect(JSON.stringify(e.oldValue)).toBe(
        '{"apple":{"buy":45,"sell":22},"water":{"buy":20,"sell":10}}',
      );
      callback();
    });
    proxy.price = undefined;
  });
});
