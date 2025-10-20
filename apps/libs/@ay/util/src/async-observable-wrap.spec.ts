import { delay } from 'bluebird';
import { of } from 'rxjs';
import { asyncObservableWrap } from './async-observable-wrap';

describe('async-observable-wrap', () => {
  it('normal', async () => {
    const result = [];

    asyncObservableWrap(async () => of(1, 2, 3)).subscribe((item) =>
      result.push(item),
    );

    await delay(1);

    expect(result).toEqual([1, 2, 3]);
  });
});
