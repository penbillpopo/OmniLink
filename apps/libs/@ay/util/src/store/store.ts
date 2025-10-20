import { Subject } from 'rxjs';
import { Item, ITEM } from './item';

export class Store<
  TItem extends Item,
  FETCH_ARGS extends any[] = [],
  CONSTRUCTOR_ARGS extends any[] = [],
  ID = number,
> {
  public readonly constructorArgs: CONSTRUCTOR_ARGS;

  private _store: Map<
    ID,
    {
      count: number;
      value: Promise<TItem>;
    }
  > = new Map();

  public constructor(
    private _resource: ITEM<TItem, FETCH_ARGS, CONSTRUCTOR_ARGS, ID>,
    ...args: CONSTRUCTOR_ARGS
  ) {
    this.constructorArgs = args;
  }

  public async use(id: ID, ...fetchArgs: FETCH_ARGS): Promise<TItem> {
    const resourcePromise = this.fetch(id, ...fetchArgs);
    const item = this._store.get(id);
    item.count++;
    const resource = await resourcePromise;
    return resource;
  }

  public async fetch(id: ID, ...fetchArgs: FETCH_ARGS): Promise<TItem> {
    if (!this._store.has(id)) {
      const value = this._resource.create(id, fetchArgs, this.constructorArgs);
      const count = 0;
      this._store.set(id, { count, value });
      value.catch(() => this._store.delete(id));
    }

    const item = this._store.get(id);
    const resource = await item.value;
    return resource;
  }

  public onUpdate = new Subject<Promise<TItem>>();

  public async update(id: ID, ...fetchArgs: FETCH_ARGS) {
    const createResource = () =>
      this._resource.create(id, fetchArgs, this.constructorArgs).catch((e) => {
        this._store.delete(id);
        throw e;
      });

    if (this._store.has(id)) {
      const item = this._store.get(id);
      item.value = item.value
        .then((value) => value.destroy().catch(() => this._store.delete(id)))
        .then(() => createResource());
    } else {
      this._store.set(id, { count: 0, value: createResource() });
    }

    const item = this._store.get(id);
    this.onUpdate.next(item.value);
    const resource = await item.value;
    return resource;
  }

  public isExist(id: ID): boolean {
    return this._store.has(id);
  }

  public async destroy(id: ID) {
    if (!this._store.has(id)) return;
    const item = this._store.get(id);
    item.count--;

    if (item.count <= 0) {
      this._store.delete(id);
      const ref = await item.value;
      try {
        await ref.destroy();
      } catch (error) {
        console.error("Can't destroy resource: ", ref);
        console.error(error);
      }
    }
  }
}
