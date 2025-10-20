export function Session() {
  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {};
}

export class BasicSessionDto<T> {
  public user?: T;

  [key: string]: any;
}
