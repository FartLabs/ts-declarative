import { getAsBlob, set as setAsBlob } from "@kitsonk/kv-toolbox/blob";
// deno-types="@types/n3"
import type { Quad } from "n3";
// deno-types="@types/n3"
import { Parser, Store, Writer } from "n3";

/**
 * getAsN3Store gets an n3 store from Deno.Kv storage.
 */
export async function getAsN3Store(
  kv: Deno.Kv,
  key: Deno.KvKey,
  consistency?: Deno.KvConsistencyLevel,
): Promise<Store<Quad, Quad, Quad, Quad> | null> {
  const store = new Store<Quad, Quad, Quad, Quad>();
  const file = await getAsBlob(kv, key, { consistency });
  if (file !== null) {
    // https://github.com/rdfjs/N3.js#parsing
    const parser = new Parser({ format: file.type || undefined });
    const quads = parser.parse(await file.text());
    store.addQuads(quads);
    return store;
  }

  return null;
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
