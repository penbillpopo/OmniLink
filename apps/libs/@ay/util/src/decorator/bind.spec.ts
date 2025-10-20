import { bind } from './bind';

declare let Reflect: any;

describe('auto bind method decorator', function () {
  class A {
    public value: number;

    public constructor() {
      this.value = 42;
    }

    @bind
    public getValue() {
      return this.value;
    }
  }

  it('binds methods to an instance', function () {
    const a = new A();
    const getValue = a.getValue;
    expect(getValue()).toBe(42);
  });

  it('binds method only once', function () {
    const a = new A();
    expect(a.getValue).toBe(a.getValue);
  });

  it('binds methods with symbols as keys', function () {
    const symbol = Symbol('method');

    class A {
      public constructor() {
        this['val'] = 42;
      }

      @bind
      public [symbol]() {
        return this['val'];
      }
    }

    const a = new A();
    const getValue = a[symbol];

    expect(getValue()).toBe(42);
  });

  it('throws if applied on a method of more than zero arguments', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class A {
        @bind
        public get value() {
          return 1;
        }
      }
    }).toThrowError();
  });
});

describe('autobind class decorator', function () {
  const symbol = Symbol('getValue');

  @bind
  class A {
    public value: number;
    public constructor() {
      this.value = 42;
    }

    public getValue() {
      return this.value;
    }

    public [symbol]() {
      return this.value;
    }
  }

  it('binds methods to an instance', function () {
    const a = new A();
    const getValue = a.getValue;
    expect(getValue()).toBe(42);
  });

  it('binds method only once', function () {
    const a = new A();
    expect(a.getValue).toBe(a.getValue);
  });

  it('ignores non method values', function () {
    expect(() => {
      @bind
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class A {
        public get value() {
          return 1;
        }
      }
    }).not.toThrow();
  });

  it('does not override itself when accessed on the prototype', function () {
    A.prototype.getValue; // eslint-disable-line no-unused-expressions

    const a = new A();
    const getValue = a.getValue;
    expect(getValue()).toBe(42);
  });

  describe('with Reflect', function () {
    describe('with Symbols', function () {
      it('binds methods with symbol keys', function () {
        const a = new A();
        const getValue = a[symbol];
        expect(getValue()).toBe(42);
      });
    });
  });

  describe('without Reflect', function () {
    let A: any;

    const _Reflect = Reflect;
    Reflect = undefined;

    @bind
    class B {
      public value: number;
      public constructor() {
        this.value = 42;
      }

      public getValue() {
        return this.value;
      }

      public [symbol]() {
        return this.value;
      }
    }
    // eslint-disable-next-line prefer-const
    A = B;

    Reflect = _Reflect;

    it('falls back to Object.getOwnPropertyNames', function () {
      const a = new A();
      const getValue = a.getValue;
      expect(getValue()).toBe(42);
    });

    describe('with Symbols', function () {
      it('falls back to Object.getOwnPropertySymbols', function () {
        const a = new A();
        const getValue = a[symbol];
        expect(getValue()).toBe(42);
      });
    });
  });

  describe('without Symbols', function () {
    const _Symbol = Symbol;
    const _getOwnPropertySymbols = Object.getOwnPropertySymbols;
    let A;

    beforeAll(function () {
      Symbol = undefined;
      Object.getOwnPropertySymbols = undefined;

      @bind
      class B {
        public value: number;
        public constructor() {
          this.value = 42;
        }

        public getValue() {
          return this.value;
        }
      }
      A = B;
    });

    afterAll(function () {
      Symbol = _Symbol;
      Object.getOwnPropertySymbols = _getOwnPropertySymbols;
    });

    it('does throws no error if Symbol is not supported', function () {
      const a = new A();
      const getValue = a.getValue;
      expect(getValue()).toBe(42);
    });
  });
});
