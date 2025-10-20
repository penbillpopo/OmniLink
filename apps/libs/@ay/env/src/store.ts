export class Environment<T = any> {
  public constructor(
    public readonly key: string,
    public readonly defaultValue: T,
    public readonly type: string,
  ) {}
}

export class EnvironmentStore {
  public readonly store: { [key: string]: Environment<any> } = {};

  public add<T>(key: string, defaultValue: T, type: string) {
    const matched = /_(\d+)$/.exec(key);
    if (matched && matched[1] !== '1') {
      return;
    }
    const environment = new Environment(key, defaultValue, type);
    this.store[key] = environment;
  }
}

export const environmentStore = new EnvironmentStore();
