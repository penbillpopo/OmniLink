import { Map } from '@ay/util';
import { INestApplication, Logger } from '@nestjs/common';
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Connection } from './connection';
import { Rule, WebSocketRoute } from './route';

export class WebSocketServer {
  private _logger = new Logger(WebSocketServer.name);
  public app: INestApplication;
  public port: number;
  public io: Server;
  public routes: Map<WebSocketRoute> = {};
  public clients: Connection[];
  public jwtPublicKey: string | Buffer;
  public queryLimitPerSeconds = 500;

  public listen(port: number, ...servers: HttpServer[]) {
    if (this.io) {
      this._logger.error(`Websocket 已開啟於 ${this.port} 埠`);
      return;
    }

    this.io = new Server(port, {
      pingInterval: 1000,
      cors: {
        origin: (
          origin: string | undefined,
          callback: (err: Error | null, origin?: string) => void,
        ) => {
          callback(null, origin);
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', this.onConnection.bind(this));

    this._attachServers(servers);

    this._logger.log(`Websocket 開啟於 ${port} 埠`);
  }

  private _attachServers(servers: HttpServer[]) {
    servers.map((server) => this._attachServer(server));
  }

  private _attachServer(server: HttpServer) {
    try {
      this.io.attach(server);
    } catch (error) {
      this._logger.error('連結伺服器發生錯誤', server);
    }
  }

  public on(route: {
    path: string;
    controller: any;
    method: string;
    rules: Rule[];
  }) {
    this.routes[route.path] = {
      ...route,
      identifier: `${route.controller.name}.${route.method}`,
    };
  }

  public onConnection(socket: Socket) {
    const address = socket.handshake.address.split(':').pop();
    const connection = new Connection(address, socket, this);

    connection.queryLimitPerSeconds = this.queryLimitPerSeconds;
    socket.on('execute', connection.execute.bind(connection));
    socket.on('subscribe', connection.subscribe.bind(connection));
    socket.on('dispose', connection.dispose.bind(connection));
    socket.on('upload_init', connection.uploadInit.bind(connection));
    socket.on(
      'upload_processing',
      connection.uploadProcessing.bind(connection),
    );
    socket.on('upload_cancel', connection.uploadCancel.bind(connection));
    socket.on('disconnect', connection.disconnect.bind(connection));
    this._logger.log(`Websocket 與 '${address}' 建立連線`);
  }
}
