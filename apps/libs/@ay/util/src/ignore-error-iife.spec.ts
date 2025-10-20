import { delay } from 'bluebird';
import { CodeErrorGenerate } from './code-error';
import { asyncIgnoreErrorIife, ignoreErrorIife } from './ignore-error-iife';

describe('ignore-error-iife', () => {
  it('CodeError', () => {
    const TestCodeError = CodeErrorGenerate(`TEST_CODE_ERROR`);
    TestCodeError.code = 'TEST_CODE_ERROR';

    let i = 0;
    ignoreErrorIife(() => {
      throw new TestCodeError();
      i = 100;
    }, TestCodeError);

    expect(i).toEqual(0);
  });

  it('async CodeError', async () => {
    const TestAsyncCodeError = CodeErrorGenerate(`TEST_ASYNC_CODE_ERROR`);
    TestAsyncCodeError.code = 'TEST_ASYNC_CODE_ERROR';
    let i = 0;

    await asyncIgnoreErrorIife(async () => {
      await delay(10);
      throw new TestAsyncCodeError();
      i = 100;
    }, TestAsyncCodeError);

    expect(i).toEqual(0);
  });
});
