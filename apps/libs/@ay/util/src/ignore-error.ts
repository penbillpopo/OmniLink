export function ignoreError(Error: any) {
  return function (error: any) {
    if (error instanceof Error) return null;
    else throw error;
  };
}
