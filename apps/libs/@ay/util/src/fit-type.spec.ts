import { fitType } from './fit-type';
describe('fitType', () => {
  it('fitType NaN', (done) => {
    expect(isNaN(fitType('NaN'))).toBe(true);
    done();
  });

  it('fitType undefined', (done) => {
    const type = fitType('undefined');
    expect(typeof type).toBe('undefined');
    done();
  });

  it('fitType null', (done) => {
    const type = fitType('null');
    expect(type === null).toBe(true);
    done();
  });

  it('fitType true', (done) => {
    expect(fitType('true')).toBe(true);
    done();
  });

  it('fitType false', (done) => {
    expect(fitType('false')).toBe(false);
    done();
  });

  it('fitType string', (done) => {
    const type = fitType('0938591548');
    expect(typeof type).toBe('string');
    expect(type).toBe('0938591548');
    done();
  });

  it('fitType string2', (done) => {
    const type = fitType('00938591548');
    expect(typeof type).toBe('string');
    expect(type).toBe('00938591548');
    done();
  });

  it('fitType string3', (done) => {
    const type = fitType('1-3');
    expect(typeof type).toBe('string');
    expect(type).toBe('1-3');
    done();
  });

  it('fitType string4', (done) => {
    const type = fitType('300,000');
    expect(typeof type).toBe('string');
    expect(type).toBe('300,000');
    done();
  });

  it('fitType string5', (done) => {
    const type = fitType('123wtf321');
    expect(typeof type).toBe('string');
    expect(type).toBe('123wtf321');
    done();
  });

  it('fitType string6', (done) => {
    const type = fitType('wtf321');
    expect(typeof type).toBe('string');
    expect(type).toBe('wtf321');
    done();
  });

  it('fitType string7', (done) => {
    const type = fitType('00.938591548');
    expect(typeof type).toBe('string');
    expect(type).toBe('00.938591548');
    done();
  });

  it('fitType number', (done) => {
    const type = fitType('321.123');
    expect(typeof type).toBe('number');
    expect(type).toBe(321.123);
    done();
  });

  it('fitType number2', (done) => {
    const type = fitType(' -321.123');
    expect(typeof type).toBe('number');
    expect(type).toBe(-321.123);
    done();
  });

  it('fitType number3', (done) => {
    const type = fitType('0.123');
    expect(typeof type).toBe('number');
    expect(type).toBe(0.123);
    done();
  });

  it('fitType number4', (done) => {
    const type = fitType('-0.123');
    expect(typeof type).toBe('number');
    expect(type).toBe(-0.123);
    done();
  });

  it('fitType error number', (done) => {
    const type = fitType(' -.123');
    expect(typeof type).toBe('number');
    expect(type).toBe(-0.123);
    done();
  });
  it('fitType error number', (done) => {
    const type = fitType(' .123');
    expect(typeof type).toBe('number');
    expect(type).toBe(0.123);
    done();
  });

  it('fitType Infinity', (done) => {
    const type = fitType('Infinity');
    expect(typeof type).toBe('number');
    expect(type).toBe(Infinity);
    done();
  });

  it('fitType -Infinity', (done) => {
    const type = fitType(' -Infinity');
    expect(typeof type).toBe('number');
    expect(type).toBe(-Infinity);
    done();
  });
});
