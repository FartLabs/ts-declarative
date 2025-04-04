import type { OpenAPIServerStorage } from "./storage.ts";

export class DenoKvOpenAPIServerStorage implements OpenAPIServerStorage {
  public constructor(public kv: Deno.Kv, public prefix: Deno.KvKey = []) {}

  public async get<T>(key: string): Promise<T | undefined> {
    const result = await this.kv.get<T>([...this.prefix, key]);
    if (result.value === null) {
      return;
    }

    return result.value;
  }

  public async set<T>(key: string, value: T): Promise<void> {
    await this.kv.set([...this.prefix, key], value);
  }

  public async delete(key: string): Promise<void> {
    await this.kv.delete([...this.prefix, key]);
  }

  public async list<T>(): Promise<T[]> {
    const result = await Array.fromAsync(
      this.kv.list<T>({ prefix: this.prefix }),
    );

    return result.map((entry) => entry.value);
  }

  /**
   * clear clears all data from storage.
   */
  public static async clear(kv: Deno.Kv): Promise<void> {
    for await (const entry of kv.list({ prefix: [] })) {
      await kv.delete(entry.key);
    }
  }
}
