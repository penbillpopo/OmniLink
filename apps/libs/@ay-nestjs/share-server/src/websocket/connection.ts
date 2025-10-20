import {
  bind,
  CodeError,
  CodeErrorGenerate,
  CodeErrorParser,
  Error,
} from '@ay/util';
import { HttpStatus, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { parseData } from '../parse-data';
import { BasicSessionDto } from '../session';
import { ExecuteBehavior } from './execute';
import { WebSocketRoute } from './route';
import { WebSocketServer } from './server';
import { SubscribeBehavior } from './subscribe';
import { UploadBehavior } from './upload';

export const UNKNOWN_ERROR = CodeErrorGenerate(
  `未知的錯誤`,
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export const UNAUTHORIZED = CodeErrorGenerate(
  'Unauthorized',
  HttpStatus.UNAUTHORIZED,
);

export class Connection {
  private static _codeErrorParser = new CodeErrorParser();
  private readonly _logger = new Logger(`WS`);
  public ip = '';
  public session = new Proxy({} as BasicSessionDto<any>, {
    set: (target, key: string, value: any, receiver: any) => {
      target[key] = value;
      return true;
    },
  });

  public queryLimitPerSeconds = 500;
  public thisSecondsQueryCount = 0;

  private _executeBehavior = new ExecuteBehavior(this, this.server);
  private _subscribeBehavior = new SubscribeBehavior(this, this.server);
  private _uploadBehavior = new UploadBehavior(this, this.server);

  public constructor(
    public address: string,
    public socket: Socket,
    public server: WebSocketServer,
  ) {
    this.session.ip =
      socket.request?.headers?.['x-real-ip']?.toString() ||
      socket.request?.connection?.remoteAddress?.toString();
    this.ip = this.session.ip;
  }

  public emit(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }

  public async execute(
    method: string,
    args: any[],
    callback: (result: string, response: any) => void,
  ): Promise<void> {
    let route: WebSocketRoute;
    const start = Date.now();
    try {
      this.checkQueryLimit();
      route = this.server.routes[method];
      args = this.parseArgs(route, args);
      const response = await this._executeBehavior.execute(route, args);
      callback('success', response);
      this.log(
        `執行 ${route.identifier} (${this.parseArgsLog(args, route)}) +${
          Date.now() - start
        }ms`,
      );
    } catch (error) {
      error = this.parseError(error, route, args);
      callback('error', JSON.stringify(error));
    }
  }

  public async subscribe(method: string, args: any[], jobId: string) {
    let key = '';
    let route: WebSocketRoute;
    const start = Date.now();
    try {
      this.checkQueryLimit();
      route = this.server.routes[method];
      key = `${route.path}/${jobId}`;
      const processedArgs = this.parseArgs(route, args);
      await this._subscribeBehavior.subscribe(route, processedArgs, jobId);
      this.log(
        `訂閱 ${route.identifier} (${this.parseArgsLog(args, route)}) +${
          Date.now() - start
        }ms`,
      );
    } catch (error) {
      error = this.parseError(error, route, args);
      this.emit(key, 'error', JSON.stringify(error));
    }
  }

  public async dispose(method: string, jobId: string) {
    return this._subscribeBehavior.dispose(method, jobId);
  }

  public async uploadInit(method: string, args: any[], jobId: string) {
    let key = '';
    let route: WebSocketRoute;

    try {
      this.checkQueryLimit();
      route = this.server.routes[method];
      key = `${route.path}/${jobId}`;
      const processedArgs = this.parseArgs(route, args);
      this._uploadBehavior.init(route, processedArgs, jobId);
    } catch (error) {
      error = this.parseError(error, route, args);
      this.emit(key, 'error', JSON.stringify(error));
    }
  }

  public uploadProcessing(
    method: string,
    fileIndex: number,
    buffer: Buffer,
    jobId: string,
  ) {
    let key = '';
    let route: WebSocketRoute;
    try {
      const route = this.server.routes[method];
      key = `${route.path}/${jobId}`;
      this._uploadBehavior.processing(route, fileIndex, buffer, jobId);
    } catch (error) {
      error = this.parseError(error, route, []);
      this.emit(key, 'error', JSON.stringify(error));
    }
  }

  public uploadCancel(method: string, jobId: string) {
    const route = this.server.routes[method];
    this._uploadBehavior.cancel(route, jobId);
  }

  @bind
  public disconnect() {
    this._subscribeBehavior.unsubscribeAll();
  }

  public checkQueryLimit() {
    this.thisSecondsQueryCount++;
    setTimeout(() => this.thisSecondsQueryCount--, 1000);
    if (this.thisSecondsQueryCount > this.queryLimitPerSeconds) {
      throw new Error('API0001', 'Request limit reached');
    }
  }

  public parseArgs(route: WebSocketRoute, args: any[]) {
    const processedArgs = [];

    let argOffset = 0;
    for (let i = 0; i < route.rules.length; i++) {
      const rule = route.rules[i];

      if (rule.decorators?.includes('@User()')) {
        if (!this.session.user) {
          throw new UNAUTHORIZED();
        }
        processedArgs.push(this.session.user);
      } else if (rule.decorators?.includes('@Session()')) {
        processedArgs.push(this.session);
      } else {
        processedArgs.push(
          parseData(
            rule.name,
            args[argOffset] !== undefined && args[argOffset] !== null
              ? args[argOffset]
              : rule.initializer,
            rule.type,
            rule.required,
          ),
        );
        argOffset++;
      }
    }

    return processedArgs;
  }

  public parseError(error: any, route: WebSocketRoute, args: any[]) {
    try {
      error = Connection._codeErrorParser.parse(error);
    } catch {}

    if (error instanceof CodeError) {
      this.log(
        `執行時發生 ${error.code} 錯誤 ${route.identifier} (${this.parseArgsLog(
          args,
          route,
        )})`,
      );
    } else {
      this.error(
        `執行時發生未預期的錯誤 ${route.identifier} (${this.parseArgsLog(
          args,
          route,
        )})`,
      );
      console.error(error, error.stack);
      error = new UNKNOWN_ERROR();
    }

    return error;
  }

  public parseArgsLog(args: any[], route: WebSocketRoute) {
    return args
      .map((arg, index) => {
        if (route?.rules?.[index]?.decorators?.includes('@Session()')) {
          return '@Session';
        }

        if (route?.rules?.[index]?.decorators?.includes('@Password()')) {
          return '@Password';
        }

        if (route?.rules?.[index]?.decorators?.includes('@User()')) {
          return '@User';
        }

        if (arg?.toLogString) {
          return arg.toLogString();
        }

        return JSON.stringify(arg);
      })
      .filter((arg) => arg !== undefined)
      .join(', ');
  }

  public log(message: string) {
    message = this._appendLogPrefix(message);
    this._logger.log(message);
  }

  public error(message: string) {
    message = this._appendLogPrefix(message);
    this._logger.error(message);
  }

  private _appendLogPrefix(message: string) {
    if (this.session.user) {
      message = `[${this.session.user.toLogString()}] ${message}`;
    } else {
      message = `[@Ip(${this.ip})] ${message}`;
    }
    return message;
  }
}
