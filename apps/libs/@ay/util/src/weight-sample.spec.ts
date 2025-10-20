import { weightSample } from './weight-sample';

describe('weighted-sample', () => {
  it('default', () => {
    const item = weightSample([
      { weight: 1, item: 1 },
      { weight: 1000, item: 2 },
    ]);
    expect(item).toEqual([2]);
  });

  it('count', () => {
    const item = weightSample(
      [
        { weight: 1, item: 1 },
        { weight: 1000, item: 2 },
      ],
      2,
    );
    expect(item).toEqual([2, 2]);
  });

  it('invert', () => {
    const item = weightSample(
      [
        { weight: 1, item: 1 },
        { weight: 1000, item: 2 },
      ],
      1,
      true,
    );
    expect(item).toEqual([1]);
  });

  it('takeOut', () => {
    const item = weightSample(
      [
        { weight: 1, item: 1 },
        { weight: 1000, item: 2 },
      ],
      2,
      false,
      true,
    );
    expect(item).toEqual(expect.arrayContaining([1, 2]));
  });
});
