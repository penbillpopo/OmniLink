import { Connection } from './connection';
import { WebSocketServer } from './server';

export class Behavior {
  public constructor(
    public connection: Connection,
    public server: WebSocketServer,
  ) {}

  public emit(event: string, ...args: any[]) {
    return this.connection.emit(event, ...args);
  }
}
