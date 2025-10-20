import { Item } from './item';
import { Store } from './store';

describe('Store', () => {
  class Resource extends Item<number> {
    public static idx = 0;
    public static createFailed = false;
    public static destroyFailed = false;
    public idx: number;

    protected constructor(id: number) {
      super(id);
      this.idx = ++Resource.idx;
    }

    public static async create(
      id: number,
      fetchArgs: [],
      constructor: [],
    ): Promise<Resource> {
      const result = new Resource(id);
      if (Resource.createFailed) {
        throw new Error('error');
      }
      return result;
    }

    public async destroy() {
      if (Resource.destroyFailed) {
        throw new Error('error');
      }
      return;
    }
  }

  describe('should be able to create a Store', () => {
    const store = new Store(Resource);
    expect(store).toBeInstanceOf(Store);

    it('should be able to fetch an item', async () => {
      const item = await store.fetch(1);
      expect(item).toBeInstanceOf(Resource);
      expect(item.id).toBe(1);
    });

    it('should be able to fetch the same item twice', async () => {
      const item = await store.fetch(2);
      const item2 = await store.fetch(2);

      expect(item).toBe(item2);
    });

    it('create new instance after destroy', async () => {
      const item = await store.fetch(3);
      await store.destroy(3);

      const item2 = await store.fetch(3);
      expect(item).not.toBe(item2);
    });

    it('do not destroy after use twice', async () => {
      await store.use(4);
      await store.use(4);

      await store.destroy(4);
      expect(store.isExist(4)).toBe(true);
    });

    it('clear item after same times destroy', async () => {
      await store.use(5);
      await store.use(5);

      await store.destroy(5);
      await store.destroy(5);
      expect(store.isExist(5)).toBe(false);
    });

    it('when create failed, do not store cache', async () => {
      Resource.createFailed = true;
      await expect(() => store.fetch(10)).rejects.toThrowError('error');
      Resource.createFailed = false;

      expect(store.isExist(10)).toBe(false);
    });

    it('when destroy failed, clear cache', async () => {
      await store.fetch(11);
      await store.destroy(11);
      expect(store.isExist(11)).toBe(false);
    });

    it('can update', async () => {
      const item = await store.fetch(6);
      const idx = item.idx;

      const item2 = await store.update(6);

      expect(item2.idx).toBeGreaterThan(idx);
    });

    it('can update after destroy', async () => {
      await store.destroy(7);
      const item = await store.update(7);
      expect(item).toBeInstanceOf(Resource);
      expect(item.id).toBe(7);
    });

    it('can update after use', async () => {
      await store.use(8);
      const item = await store.update(8);
      expect(item).toBeInstanceOf(Resource);
      expect(item.id).toBe(8);
    });

    it('update with create failed', async () => {
      await store.fetch(9);
      Resource.createFailed = true;
      await expect(() => store.update(9)).rejects.toThrowError('error');
      Resource.createFailed = false;

      const item = await store.fetch(9);
      expect(item).toBeInstanceOf(Resource);
      expect(item.id).toBe(9);
    });

    it('update with destroy failed', async () => {
      await store.fetch(10);
      Resource.destroyFailed = true;
      await store.update(10);
      Resource.destroyFailed = false;

      const item = await store.fetch(10);

      expect(item).toBeInstanceOf(Resource);
      expect(item.id).toBe(10);
    });

    it('should real destroy when destroy failed', async () => {
      await store.fetch(11);

      Resource.destroyFailed = true;
      await store.destroy(11);
      Resource.destroyFailed = false;

      expect(store.isExist(11)).toBe(false);
    });
  });
});
