export function ignoreErrorIife<T>(fn: () => T, ...Errors: any[]): T | null {
  try {
    return fn();
  } catch (error) {
    for (const Error of Errors) {
      if (error instanceof Error) {
        return null;
      }
    }

    throw error;
  }
}

export async function asyncIgnoreErrorIife<T>(
  fn: () => Promise<T>,
  ...ERRORS: any
): Promise<T> {
  try {
    const response = await fn();
    return response;
  } catch (error) {
    for (const Error of ERRORS) {
      if (error instanceof Error) {
        return null;
      }
    }
    throw error;
  }
}
