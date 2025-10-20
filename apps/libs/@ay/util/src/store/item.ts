export interface ITEM<
  Item,
  FETCH_ARGS extends any[] = [],
  CONSTRUCTOR_ARGS extends any[] = [],
  ID = number,
> {
  create(
    id: ID,
    fetchArgs: FETCH_ARGS,
    constructor: CONSTRUCTOR_ARGS,
  ): Promise<Item>;
}

export abstract class Item<ID = number> {
  protected constructor(public id: ID) {}
  public abstract destroy(): Promise<void>;
}
