import { assertEquals } from "@std/assert/equals";
import { jsonld, jsonldOf } from "#/lib/declarative/common/jsonld/jsonld.ts";
import { N3StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/n3/store.ts";

@jsonld({ context: "https://schema.org/" })
class Person {
  public constructor(public givenName?: string) {}
}

Deno.test("n3 store stores valid resources", async () => {
  const store = new N3StandardMethodStore(jsonldOf(Person));
  const ash = new Person("Ash Ketchum");
  await store.set(["https://example.com/ash"], ash);

  const result = await store.get<Person>(["https://example.com/ash"]);
  const actual = new Person(result?.givenName);
  assertEquals(actual, ash);
});
