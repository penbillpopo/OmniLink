import Bluebird from 'bluebird';
import { Behavior } from './behavior';
import { WebSocketRoute } from './route';

export class ExecuteBehavior extends Behavior {
  public async execute(route: WebSocketRoute, args: any[]) {
    const controller = this.connection.server.app.get(route.controller);
    const method = controller[route.method];
    const response = await Bluebird.resolve(
      method.apply(controller, args),
    ).timeout(10 * 1000);
    return response;
  }
}
