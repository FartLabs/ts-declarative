// deno-types="@types/n3"
import { Store } from "n3";
import { assertEquals } from "@std/assert/equals";
import { jsonld, jsonldOf } from "#/lib/declarative/common/jsonld/jsonld.ts";
import { N3StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/n3/store.ts";

@jsonld({ context: "https://schema.org/" })
class Person {
  public constructor(public givenName?: string) {}
}

Deno.test({
  name: "n3 store stores valid resources",
  fn: async (t) => {
    const n3Store = new Store();
    const store = new N3StandardMethodStore(jsonldOf(Person), n3Store);
    const ash = new Person("Ash Ketchum");

    await t.step("sets resource", async () => {
      await store.set(["https://example.com/ash"], ash);
      assertEquals(n3Store.size, 2);
    });

    await t.step("gets resource", async () => {
      const result = await store.get<Person>(["https://example.com/ash"]);
      const actual = new Person(result?.givenName);
      assertEquals(actual, ash);
    });

    // TODO: Leaks detected:
    // A fetch response body was created during the test, but not consumed during the test.
    // Consume or close the response body `ReadableStream`, e.g `await resp.text()` or `await resp.body.cancel()`.
    //
    // await t.step("lists resources", async () => {
    //   const result = await Array.fromAsync(store.list<Person>());
    //   const actual = result.map((person) => new Person(person.givenName));
    //   assertEquals(actual, [ash]);
    // });

    await t.step("deletes resource", async () => {
      await store.delete(["https://example.com/ash"]);
      assertEquals(n3Store.size, 0);
    });
  },
});
