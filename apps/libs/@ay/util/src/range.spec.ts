import { inRange, limitRange } from './range';

describe('limitRange', () => {
  it('max', () => {
    expect(limitRange(0, 100, 10)).toBe(10);
  });

  it('min', () => {
    expect(limitRange(0, -100, 10)).toBe(0);
    expect(limitRange(0, -0, 1)).toBe(0);
    expect(limitRange(0, -1, 1)).toBe(0);
    expect(limitRange(0, 0, 1)).toBe(0);
  });

  it('normal', () => {
    expect(limitRange(0, 50, 100)).toBe(50);
  });
});

describe('inRange', () => {
  it('max', () => {
    expect(inRange(0, 100, 10)).toBe(false);
  });

  it('min', () => {
    expect(inRange(0, -100, 10)).toBe(false);
  });

  it('normal', () => {
    expect(inRange(0, 50, 100)).toBe(true);
  });
});
