import type { StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/standard-method-store.ts";

/**
 * MemoryStandardMethodStore is an in-memory storage system.
 */
export class MemoryStandardMethodStore implements StandardMethodStore {
  /**
   * constructor constructs a new MemoryStandardMethodStore.
   */
  public constructor(public data: Map<string, unknown> = new Map()) {}

  /**
   * set sets the value of a key into memory.
   */
  public set<T>(key: string[], value: T): Promise<void> {
    this.data.set(key.join("/"), value);
    return Promise.resolve();
  }

  /**
   * get gets the value of a key from memory.
   */
  public get<T>(key: string[]): Promise<T | null> {
    const value = this.data.get(key.join("/")) ?? null;
    return Promise.resolve(value as T | null);
  }

  /**
   * delete deletes the value of a key from memory.
   */
  public delete(key: string[]): Promise<void> {
    this.data.delete(key.join("/"));
    return Promise.resolve();
  }

  /**
   * list lists the values from memory.
   */
  public async *list<T>(prefix: string[] = []): AsyncIterable<T> {
    for (const [key, value] of this.data) {
      if (prefix.length > 0 && !key.startsWith(prefix.join("/"))) {
        continue;
      }

      yield value as T;
    }
  }
}
