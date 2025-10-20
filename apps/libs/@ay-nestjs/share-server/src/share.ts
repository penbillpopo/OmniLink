export class SharedMethod {
  public constructor(
    public moduleName: string,
    public methodName: PropertyKey,
    public descriptor: PropertyDescriptor,
  ) {}
}

export const SharedMethods: SharedMethod[] = [];

export function Share() {
  return (
    target: object,
    methodName: PropertyKey,
    descriptor: PropertyDescriptor,
  ) => {
    const className = target.constructor.name;
    SharedMethods.push(new SharedMethod(className, methodName, descriptor));
  };
}
