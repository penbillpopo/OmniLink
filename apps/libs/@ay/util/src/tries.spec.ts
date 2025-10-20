import { tries } from './tries';

describe('tries', () => {
  it('first time success', async () => {
    const ori = () => Promise.resolve('OK');
    const fn = jest.fn(ori);
    const res = await tries(fn);
    expect(res).toBe('OK');
    expect(fn.mock.calls.length).toBe(1);
  });

  it('second time success', async () => {
    const ori = (times: number) =>
      times == 2 ? Promise.resolve('OK') : Promise.reject('FAIL');
    const fn = jest.fn(ori);
    const res = await tries(fn);
    expect(res).toBe('OK');
    expect(fn.mock.calls.length).toBe(2);
  });

  it('throw last error when fail', async () => {
    const ori = (times: number) => Promise.reject('FAIL' + times);
    const fn = jest.fn(ori);

    try {
      await tries(fn);
      throw new Error('FAIL');
    } catch (error) {
      expect(fn.mock.calls.length).toBe(3);
      expect(error).toBe('FAIL3');
    }
  });
});
