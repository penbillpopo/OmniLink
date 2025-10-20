export abstract class Item {
  public abstract isEqual(item: Item): boolean;
}

export class Queue<I extends Item> {
  private _queue = [];

  public add(item: I): void {
    this._queue.push(item);
  }

  public next() {
    if (this._queue.length === 0) {
      throw 'NOT EXTRA ITEM';
    }
    return this._queue.shift();
  }

  public remove(looked: I): boolean {
    const idx = this._queue.findIndex((item) => item.isEqual(looked));
    if (idx === -1) {
      return;
    }
    this._queue.splice(idx, 1);
    return true;
  }

  public run(fn: (item: I) => any): void {
    this._queue.map((item) => fn(item));
  }

  public find(looked: I): I {
    const exist = this._queue.find((item) => item.isEqual(looked));
    return exist;
  }

  public hasNext() {
    return this._queue.length;
  }
}
