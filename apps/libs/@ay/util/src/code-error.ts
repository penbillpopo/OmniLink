import { AxiosError } from 'axios';
import _, { isUndefined, negate, pickBy } from 'lodash';
import 'reflect-metadata';

const defaultKeys = ['code', 'message', 'status'];
export class CodeError extends Error {
  public static _code = 'CODE_ERROR';

  public static _class: any;

  public detail: any;

  public constructor(message: string, public httpStatus: number) {
    super(message);
    Object.setPrototypeOf(this, CodeError.prototype);
  }

  public get code() {
    return this['__proto__']['constructor']['_code'];
  }

  public static set code(code: string) {
    this._code = code;
    Object.defineProperty(this._class, 'name', {
      value: code,
      configurable: true,
    });

    this.defineMetaData('code', { type: String, example: code });
  }

  public static defineMetaData(
    propertyKey: string,
    metadata: { type: any; example: any },
  ) {
    const metadataKey = 'swagger/apiModelPropertiesArray';
    const metaKey = 'swagger/apiModelProperties';
    const target = this._class.prototype;
    const properties = Reflect.getMetadata(metadataKey, target) || [];
    const key = `:${propertyKey}`;
    if (!properties.includes(key)) {
      Reflect.defineMetadata(
        metadataKey,
        [...properties, `:${propertyKey}`],
        target,
      );
    }

    const existingMetadata = Reflect.getMetadata(metaKey, target, propertyKey);

    if (existingMetadata) {
      const newMetadata = pickBy(metadata, negate(isUndefined));
      const metadataToSave = Object.assign(
        Object.assign({}, existingMetadata),
        newMetadata,
      );
      Reflect.defineMetadata(metaKey, metadataToSave, target, propertyKey);
    } else {
      Reflect.defineMetadata(
        metaKey,
        Object.assign(
          { type: Reflect.getMetadata('design:type', target, propertyKey) },
          pickBy(metadata, negate(isUndefined)),
        ),
        target,
        propertyKey,
      );
    }
    return { metakey: metaKey, target };
  }

  public toJSON() {
    return {
      ...this.detail,
      code: this.code,
      status: this.httpStatus,
      message: this.message,
    };
  }
}

export class MultipleCodeError extends CodeError {
  public static override _code = 'MULTIPLE';

  public constructor(
    protected errors: CodeError[],
    public override readonly httpStatus: number,
  ) {
    super('發生多個錯誤', httpStatus);
    Object.setPrototypeOf(this, MultipleCodeError.prototype);
  }

  public override toJSON() {
    return {
      code: this.code,
      status: this.httpStatus,
      message: this.message,
      errors: this.errors.map((error) => {
        const json = error.toJSON();
        delete json['status'];
        return json;
      }),
    };
  }
}

export function CodeErrorGenerate<T extends any[] = []>(
  message: string | ((...args: T) => string | { message: string }),
  httpStatus = 500,
  defineMeta: { [key: string]: any } = {},
) {
  const AnonymousCodeErrorClass = class extends CodeError {
    public static override code: string;

    public constructor(...args: T) {
      if (message instanceof Function) {
        const response = message(...args);
        if (response instanceof Object) {
          super(response.message, httpStatus);
          const detailKeys = _.difference(_.keys(response), defaultKeys);
          this.detail = _.pick(response, detailKeys);
        } else {
          super(response, httpStatus);
        }
      } else {
        super(message, httpStatus);
      }
      Object.setPrototypeOf(this, AnonymousCodeErrorClass.prototype);
    }
  };

  AnonymousCodeErrorClass._class = AnonymousCodeErrorClass;

  AnonymousCodeErrorClass.defineMetaData('code', {
    type: String,
    example: 'UNKNOWN_ERROR_CODE',
  });

  AnonymousCodeErrorClass.defineMetaData('status', {
    type: Number,
    example: httpStatus,
  });

  let messageExample = '';
  if (typeof message === 'string') {
    messageExample = message;
  } else {
    try {
      const res = message(...('XXX,'.repeat(100).split(',') as any));
      if (typeof res === 'string') {
        messageExample = res;
      } else {
        messageExample = res.message;
      }
    } catch (error) {
      messageExample = '';
    }
  }

  AnonymousCodeErrorClass.defineMetaData('message', {
    type: String,
    example: messageExample,
  });

  Object.entries(defineMeta).map(([key, data]) =>
    AnonymousCodeErrorClass.defineMetaData(key, data),
  );

  return AnonymousCodeErrorClass;
}

export class CodeErrorParser {
  public constructor(private readonly _errors: { [code: string]: any } = {}) {}

  public parse(
    error: AxiosError<{ code: string; message: string; status: number }>,
  ) {
    if (!error?.response?.data?.code) {
      throw error;
    }
    const data = error.response.data;
    const { code, message, status, ...detail } = data;

    if (this._errors[code] === undefined) {
      this._errors[code] = CodeErrorGenerate(message, status);
      this._errors[code].code = code;
    }

    const CodeError = this._errors[code];
    const codeError: CodeError = {} as any;
    codeError['__proto__'] = CodeError['prototype'];
    codeError.message = message;
    codeError.httpStatus = status;
    codeError.detail = detail;
    const detailKeys = _.difference(Object.keys(data), defaultKeys);
    if (detailKeys.length > 0) {
      codeError.detail = _.pick(data, detailKeys);
    }

    throw codeError;
  }
}
