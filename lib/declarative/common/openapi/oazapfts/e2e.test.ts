import { assertEquals } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { openapi } from "#/lib/declarative/common/openapi/server.ts";
import { createStandardMethodsDecoratorFactory } from "#/lib/declarative/common/google-aip/methods/standard-methods.ts";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";
import { routerOf } from "#/lib/declarative/common/router/router.ts";
import { createOazapftsClientOf, generateOazapftsClientOf } from "./client.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

const kv = await Deno.openKv(":memory:");
const standardMethods = createStandardMethodsDecoratorFactory(kv);

@standardMethods({ standardMethods: { create: true, get: true } })
@autoSchema()
class Person {
  public constructor(public name: string) {}
}

@openapi({
  specification: { servers: [{ url: "http://localhost:8000" }] },
  resources: [Person],
})
class App {}

Deno.test(
  "generateOazapftsClientOf generates client from OpenAPI specification",
  async (t) => {
    const sourceCode = await generateOazapftsClientOf(App, {
      optimistic: true,
    });

    await assertSnapshot(t, sourceCode);
  },
);

Deno.test("e2e createOazapftsClientOf dynamic import", async () => {
  const server = await Deno.serve({ port: 8000 }, routerOf(App));
  const client = await createOazapftsClientOf<
    "postPeople" | "getPeopleByPerson"
  >(App, { optimistic: true });
  const ash = new Person("Ash Ketchum");

  const createdPerson = await client.postPeople(ash);
  assertEquals(createdPerson.name, ash.name);

  const fetchedPerson = await client.getPeopleByPerson(ash.name);
  assertEquals(fetchedPerson.name, ash.name);

  await server.shutdown();
});
