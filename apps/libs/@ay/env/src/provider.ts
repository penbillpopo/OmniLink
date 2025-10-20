import { array, bool, int, ints, json, str, strs } from './basic';

export class Provider {
  public static json(provide: string, defaultValue?: any, isRequired = true) {
    return {
      provide,
      useFactory: () => json(provide, defaultValue, isRequired),
    };
  }

  public static bool(
    provide: string,
    defaultValue?: boolean,
    isRequired = true,
  ) {
    return {
      provide,
      useFactory: () => bool(provide, defaultValue, isRequired),
    };
  }

  public static str(provide: string, defaultValue?: string, isRequired = true) {
    return {
      provide,
      useFactory: () => str(provide, defaultValue, isRequired),
    };
  }

  public static int(provide: string, defaultValue?: number, isRequired = true) {
    return {
      provide,
      useFactory: () => int(provide, defaultValue, isRequired),
    };
  }

  public static ints(
    provide: string,
    defaultValue?: number[],
    isRequired = true,
  ) {
    return {
      provide,
      useFactory: () => ints(provide, defaultValue, isRequired),
    };
  }

  public static strs(
    provide: string,
    defaultValue?: string[],
    isRequired = true,
  ) {
    return {
      provide,
      useFactory: () => strs(provide, defaultValue, isRequired),
    };
  }

  public static array(
    provide: string,
    defaultValue?: string[],
    isRequired = true,
  ) {
    return {
      provide,
      useFactory: () => array(provide, defaultValue, isRequired),
    };
  }
}
