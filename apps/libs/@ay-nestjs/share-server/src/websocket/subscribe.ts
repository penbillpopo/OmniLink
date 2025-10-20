import Bluebird from 'bluebird';
import { Observable, Subscription } from 'rxjs';
import { Behavior } from './behavior';
import { WebSocketRoute } from './route';

export class SubscribeBehavior extends Behavior {
  public subscribes: {
    [key: string]: {
      subscription: Subscription;
      observable: Observable<any>;
      route: WebSocketRoute;
      args: any[];
    };
  } = {};

  public async subscribe(route: WebSocketRoute, args: any[], jobId: string) {
    const key = `${route.path}/${jobId}`;
    const controller = this.connection.server.app.get(route.controller);
    const method = controller[route.method];
    const observable = await Bluebird.resolve(
      method.apply(controller, args) as Promise<Observable<any>>,
    ).timeout(10 * 1000);

    const subscription = observable.subscribe({
      next: (data) => this.emit(key, 'success', data),
      error: (error) => this.emit(key, 'error', error),
      complete: () => this.emit(key, 'complete'),
    });

    this.subscribes[key] = { subscription, observable, route, args };

    return this.subscribes[key];
  }

  public dispose(method: string, jobId: string) {
    const key = `${method}/${jobId}`;
    this._unsubscribe(key);
  }

  public unsubscribeAll() {
    const keys = Object.keys(this.subscribes);
    keys.map((key) => this._unsubscribe(key));
  }

  private _unsubscribe(key: string) {
    const subscribe = this.subscribes[key];
    if (!subscribe) {
      return;
    }

    try {
      subscribe.subscription.unsubscribe();
      delete this.subscribes[key];
      this.connection.log(`解除訂閱 ${subscribe.route.identifier}`);
    } catch (error) {
      this.connection.error(`解除訂閱失敗 ${key}`);
      console.error(error);
    }
  }
}
