import { delay } from 'bluebird';
import { CodeError } from './code-error';

export class RETRY_TOO_MANY_TIMES extends CodeError {
  public constructor(times: number) {
    super(`嘗試次數過多 ${times}`, 500);
  }
}

export async function tries<T>(
  fn: (times: number) => Promise<T>,
  times = 3,
  interval = 100,
): Promise<T> {
  let i = 1;

  while (i <= times) {
    try {
      return await fn(i);
    } catch (error) {
      i++;
      if (i > times) throw error;
      await delay(interval);
    }
  }

  throw new RETRY_TOO_MANY_TIMES(times);
}
