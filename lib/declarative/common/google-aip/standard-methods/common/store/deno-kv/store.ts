import type { StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/standard-method-store.ts";

/**
 * DenoKvStandardMethodStore is a storage system that uses Deno Kv to store data.
 */
export class DenoKvStandardMethodStore implements StandardMethodStore {
  /**
   * constructor constructs a new DenoKvStandardMethodStore.
   */
  public constructor(public kv: Deno.Kv) {}

  /**
   * set sets the value of a key into Deno Kv.
   */
  public async set<T>(key: string[], value: T): Promise<void> {
    const result = await this.kv.set(key, value);
    if (!result.ok) {
      throw new Error(`Deno Kv: Failed to set key ${key}`);
    }
  }

  /**
   * get gets the value of a key from Deno Kv.
   */
  public async get<T>(key: string[]): Promise<T | null> {
    const result = await this.kv.get<T>(key);
    return result.value;
  }

  /**
   * delete deletes the value of a key from Deno Kv.
   */
  public async delete(key: string[]): Promise<void> {
    await this.kv.delete(key);
  }

  /**
   * list lists the values from Deno Kv.
   */
  public async *list<T>(prefix: string[] = []): AsyncIterable<T> {
    for await (const entry of this.kv.list<T>({ prefix })) {
      yield entry.value;
    }
  }
}
