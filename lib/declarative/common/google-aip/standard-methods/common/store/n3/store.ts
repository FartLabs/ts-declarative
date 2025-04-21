// deno-lint-ignore-file no-explicit-any

// deno-types="@types/n3"
import type { Quad } from "n3";
// deno-types="@types/n3"
import { Parser, Store } from "n3";
import jsonld from "jsonld";
import type { ValueJSONLd } from "#/lib/declarative/common/jsonld/jsonld.ts";
import type { StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/standard-method-store.ts";

/**
 * N3StandardMethodStoreOptions are the options for the N3StandardMethodStore.
 */
export type N3StandardMethodStoreOptions = ValueJSONLd;

/**
 * N3StandardMethodStore is an n3 storage system.
 */
export class N3StandardMethodStore implements StandardMethodStore {
  /**
   * constructor constructs a new N3StandardMethodStore.
   */
  public constructor(
    public options?: N3StandardMethodStoreOptions,
    public n3Store: Store<Quad, Quad, Quad, Quad> = new Store(),
  ) {}

  /**
   * set sets the value of a key into n3.
   */
  public async set<T>(key: string[], value: T): Promise<void> {
    const id = key.join("");
    const serialized = await jsonld.toRDF(
      {
        "@context": this.options?.context,
        "@type": this.options?.type,
        "@id": id,
        ...value,
      },
      { format: "application/n-quads" },
    );

    const parser = new Parser({ format: "application/n-quads" });
    const quads = parser.parse(serialized);

    // TODO: Get and delete existing quads before adding new ones to overwrite them.
    this.n3Store.addQuads(quads);
  }

  /**
   * get gets the value of a key from n3.
   */
  public async get<T>(key: string[]): Promise<T | null> {
    if (this.options?.context === undefined) {
      throw new Error("N3StandardMethodStore: context is required");
    }

    const id = key.join("");
    const quads = this.n3Store.match(id, null, null);
    const doc = await jsonld.compact(
      await jsonld.fromRDF(quads),
      this.options.context as any,
    );

    return doc as T | null;
  }

  /**
   * delete deletes the value of a key from n3.
   */
  public delete(_key: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  /**
   * list lists the values from n3.
   */
  public list<T>(): AsyncIterable<T> {
    throw new Error("Method not implemented.");
  }
}
