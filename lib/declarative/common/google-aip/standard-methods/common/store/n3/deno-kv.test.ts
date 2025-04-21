import { assertEquals } from "@std/assert/equals";
import { jsonld, jsonldOf } from "#/lib/declarative/common/jsonld/jsonld.ts";
import {
  DenoKvN3StandardMethodStore,
  getAsN3Store,
} from "#/lib/declarative/common/google-aip/standard-methods/common/store/n3/deno-kv.ts";

@jsonld({ context: "https://schema.org/" })
class Person {
  public constructor(public givenName?: string) {}
}

Deno.test({
  name: "Deno.Kv n3 store stores valid resources",
  fn: async (t) => {
    await using kv = await Deno.openKv(":memory:");
    const store = new DenoKvN3StandardMethodStore(
      kv,
      ["people"],
      jsonldOf(Person),
    );
    const ash = new Person("Ash Ketchum");

    await t.step("sets resource", async () => {
      await store.set(["https://example.com/ash"], ash);
      const n3Store = await getAsN3Store(kv, ["people"]);
      assertEquals(n3Store?.size, 2);
    });

    await t.step("gets resource", async () => {
      const result = await store.get<Person>(["https://example.com/ash"]);
      const actual = new Person(result?.givenName);
      assertEquals(actual, ash);
    });

    await t.step("deletes resource", async () => {
      await store.delete(["https://example.com/ash"]);
      const n3Store = await getAsN3Store(kv, ["people"]);
      assertEquals(n3Store?.size, 0);
    });
  },
});
