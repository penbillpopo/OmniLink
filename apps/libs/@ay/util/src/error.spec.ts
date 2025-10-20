import { Error } from './error';

describe('Error', () => {
  it('test 1', () => {
    const error = new Error('A0001', '發生錯誤', '詳細資料');
    expect(error.code).toBe('A0001');
    expect(error.message).toBe('發生錯誤');
    expect(error.detail).toBe('詳細資料');
  });

  it('test 2', () => {
    const error = new Error('A0001', '發生錯誤');
    expect(error.code).toBe('A0001');
    expect(error.message).toBe('發生錯誤');
  });
});
