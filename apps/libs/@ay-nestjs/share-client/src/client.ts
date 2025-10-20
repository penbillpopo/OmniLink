import axios from 'axios';
import { BehaviorSubject, firstValueFrom, from, Observable } from 'rxjs';
import {
  debounceTime,
  filter,
  mergeMap,
  take,
  takeUntil,
  zip,
} from 'rxjs/operators';
import io, { Socket } from 'socket.io-client';
import urljoin from 'url-join';
import { ExecuteBehavior } from './execute/behavior';
import { SubscribeBehavior } from './subscribe/behavior';
import { UploadBehavior } from './upload/behavior';
import { UploadResponse } from './upload/response';
import { DelayJob } from './util/delay-job';
import { Job } from './util/job';
import { Queue } from './util/queue';

export class WSClient {
  public static server: string[] = ['http://localhost'];

  public static setDefaultServer(...server: string[]) {
    WSClient.server = server;
  }

  public io: Socket;
  public connectedServer: string;

  public isConnecting = false;
  public status = new BehaviorSubject<string>('初始化');
  public connectOnReady = false;

  public servers: string[] = [];
  public serverVersion = '';
  public isTryConnection = false;

  public thisSecondsQueryCount = 0;
  public queryLimitPerSeconds = 500;
  public delayQueue = new Queue<DelayJob>();

  private _executeBehavior = new ExecuteBehavior(this);
  private _subscribeBehavior = new SubscribeBehavior(this);
  private _uploadBehavior = new UploadBehavior(this);

  public foundAvailableServer$ = this.status.pipe(
    filter((status) => status == '找到有效伺服器'),
    debounceTime(1),
  );

  public connect(...servers: string[]) {
    this._setServers(servers);
    if (this.isTryConnection) return '已經開始連線';
    this.isTryConnection = true;
    this.status.next('尋找有效伺服器');
    this._findOnlineServer();
    this.foundAvailableServer$.subscribe(() => this.connectToServer());
  }

  public connectToServer() {
    this.status.next('正在連線至伺服器');

    this._closeSocketIO();

    const url = new URL(this.connectedServer);
    const socket = urljoin(url.pathname, 'socket.io');
    this.io = io(url.host, {
      reconnection: true,
      reconnectionDelay: 500,
      path: socket,
      closeOnBeforeunload: false,
    });

    this.io.on('connect', () => {
      this.status.next('連線至伺服器');
    });

    this.io.on('connect_error', () => this.status.next('連線失敗'));
    this.io.on('connect_timeout', () => this.status.next('連線超時'));
    this.io.on('reconnect', () => this.status.next('重新連線至伺服器'));
    this.io.on('reconnect_attempt', () => this.status.next('嘗試重新連線'));
    this.io.on('reconnecting', () => this.status.next('重新連線中'));
    this.io.on('reconnect_error', () => this.status.next('重新連線發生錯誤'));
    this.io.on('reconnect_failed', () => this.status.next('重新連線失敗'));
  }

  public execute(method: string, ...args: any[]): Promise<any> {
    return this._executeBehavior.execute(method, ...args);
  }

  public subscribe<Result = any>(
    method: string,
    ...args: any[]
  ): Observable<Result> {
    return this._subscribeBehavior.subscribe(method, ...args);
  }

  public upload<Result = any>(
    method: string,
    ...args: any[]
  ): Observable<UploadResponse<Result>> {
    return this._uploadBehavior.upload(method, ...args);
  }

  private _setServers(servers: string[]) {
    if (servers.length) {
      this.servers = servers;
    } else {
      this.servers = WSClient.server.slice();
    }
  }

  private _findOnlineServer() {
    let findIndex = 0;
    const findNextServer = new BehaviorSubject(1);

    this.status
      .pipe(
        filter((status) => status == '尋找有效伺服器'),
        take(1),
        mergeMap((status) => from(this.servers)),
        zip(findNextServer),
        takeUntil(this.foundAvailableServer$),
      )
      .subscribe(async ([server, index]) => {
        try {
          const version = await this._getServerVersion(server);
          this._setAvailableServer(server, version);
        } catch (e) {
          findIndex++;
          if (findIndex !== this.servers.length) {
            return findNextServer.next(1);
          }
          this.status.next('伺服器皆無回應');
          this.isTryConnection = false;
        }
      });
  }

  private _getServerVersion(server: string): any {
    return axios.get(`${server}/status`).then((response) => response.data);
  }

  private _setAvailableServer(server: string, version: any) {
    this.connectedServer = server;
    this.serverVersion = version;
    this.status.next('找到有效伺服器');
  }

  private _closeSocketIO() {
    if (!this.io) {
      return;
    }

    try {
      this.io.close();
    } catch (error) {
      console.error('關閉 Socket.io 時發生錯誤', error);
    }
  }

  public async ready(): Promise<string> {
    return firstValueFrom(
      this.status.pipe(filter((status) => status === '連線至伺服器')),
    );
  }

  public isReady() {
    return this.status.value === '連線至伺服器';
  }

  public checkQueryLimit<JOB extends Job>(job: JOB, fn: (job: JOB) => void) {
    if (this.thisSecondsQueryCount > this.queryLimitPerSeconds) {
      this.delayQueue.add(new DelayJob(job, fn));
      return;
    }

    this.thisSecondsQueryCount++;
    setTimeout(() => {
      this.thisSecondsQueryCount--;
      if (this.delayQueue.hasNext()) {
        this._executeDelayJob();
      }
    }, 1000);

    fn(job);
  }

  private _executeDelayJob() {
    const { job, fn } = this.delayQueue.next();
    this.checkQueryLimit(job, fn);
  }
}
