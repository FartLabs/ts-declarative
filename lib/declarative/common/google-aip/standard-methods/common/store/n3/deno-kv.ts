// deno-types="@types/n3"
import type { Quad } from "n3";
// deno-types="@types/n3"
import { Parser, Store, Writer } from "n3";
import { getAsBlob, set as setAsBlob } from "@kitsonk/kv-toolbox/blob";
import type { StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/standard-method-store.ts";
import type { N3StandardMethodStoreOptions } from "./store.ts";
import { N3StandardMethodStore } from "./store.ts";

/**
 * DenoKvN3StandardMethodStore is an n3 storage system within Deno.Kv.
 */
export class DenoKvN3StandardMethodStore implements StandardMethodStore {
  /**
   * constructor constructs a new N3StandardMethodStore.
   */
  public constructor(
    public kv: Deno.Kv,
    public kvKey: Deno.KvKey,
    public options?: N3StandardMethodStoreOptions,
  ) {}

  /**
   * get gets the value of a key from Deno Kv.
   */
  public async get<T>(key: string[]): Promise<T | null> {
    const n3Store = await getAsN3Store(this.kv, this.kvKey);
    const store = new N3StandardMethodStore(this.options, n3Store);
    return await store.get<T>(key);
  }

  /**
   * set sets the value of a key into Deno Kv.
   */
  public async set<T>(key: string[], value: T): Promise<void> {
    const n3Store = await getAsN3Store(this.kv, this.kvKey);
    const store = new N3StandardMethodStore(this.options, n3Store);
    await store.set(key, value);
    await setAsN3Store(this.kv, this.kvKey, n3Store);
  }

  /**
   * delete deletes the value of a key from Deno Kv.
   */
  public async delete(key: string[]): Promise<void> {
    const n3Store = await getAsN3Store(this.kv, this.kvKey);
    const store = new N3StandardMethodStore(this.options, n3Store);
    await store.delete(key);
    await setAsN3Store(this.kv, this.kvKey, n3Store);
  }

  /**
   * list lists the values from Deno Kv.
   */
  public async *list<T>(): AsyncIterable<T> {
    const n3Store = await getAsN3Store(this.kv, this.kvKey);
    const store = new N3StandardMethodStore(this.options, n3Store);
    yield* await store.list<T>();
  }
}

/**
 * getAsN3Store gets an n3 store from Deno.Kv storage.
 */
export async function getAsN3Store(
  kv: Deno.Kv,
  key: Deno.KvKey,
  consistency?: Deno.KvConsistencyLevel,
): Promise<Store<Quad, Quad, Quad, Quad>> {
  const n3Store = new Store();
  const file = await getAsBlob(kv, key, { consistency });
  if (file !== null) {
    // https://github.com/rdfjs/N3.js#parsing
    const parser = new Parser({ format: file.type || undefined });
    const quads = parser.parse(await file.text());
    await n3Store.addQuads(quads);
  }

  return n3Store;
}

/**
 * setAsN3Store sets an n3 store in Deno.Kv storage.
 */
export async function setAsN3Store(
  kv: Deno.Kv,
  key: Deno.KvKey,
  store: Store<Quad, Quad, Quad, Quad>,
  options?: { expireIn?: number; format?: string },
): Promise<Deno.KvCommitResult> {
  // https://github.com/rdfjs/N3.js#writing
  const writer = new Writer({ format: options?.format });
  const result = writer.quadsToString(store.toArray());
  const blob = new Blob([new TextEncoder().encode(result)], {
    type: options?.format,
  });

  return await setAsBlob(kv, key, blob, { expireIn: options?.expireIn });
}
