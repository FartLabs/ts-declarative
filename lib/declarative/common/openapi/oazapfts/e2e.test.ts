import { assertEquals } from "@std/assert/equals";
import { assertSnapshot } from "@std/testing/snapshot";
import { openapi } from "#/lib/declarative/common/openapi/server.ts";
import { standardMethodsWithDenoKv } from "#/lib/declarative/common/google-aip/deno-kv.ts";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";
import { generateOazapftsClientOf } from "./client.ts";
import { routerOf } from "#/lib/declarative/common/router/router.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

const kv = await Deno.openKv(":memory:");
const standardMethod = standardMethodsWithDenoKv(kv);

@standardMethod.create()
@standardMethod.get()
@autoSchema()
class Person {
  public constructor(public name: string) {}
}

@openapi({
  specification: { servers: [{ url: "http://localhost:8080" }] },
  resources: [Person],
})
class App {}

Deno.test(
  "generateOazapftsClientOf generates client from OpenAPI specification",
  async (t) => {
    const sourceCode = await generateOazapftsClientOf(
      App,
      { optimistic: true },
    );
    await assertSnapshot(t, sourceCode);
  },
);

Deno.test("e2e Oazapfts client dynamic import", async () => {
  const server = Deno.serve({ port: 8080 }, routerOf(App));
  const ash = new Person("Ash Ketchum");

  const sourceCode = await generateOazapftsClientOf(App, { optimistic: true });
  if (sourceCode === undefined) {
    throw new Error("sourceCode is undefined");
  }

  const client = await import(
    `data:text/typescript;base64,${btoa(sourceCode)}`
  );

  const createdPerson = await client.postPeople(ash);
  assertEquals(createdPerson.name, ash.name);

  const fetchedPerson = await client.getPeopleByPerson(ash.name);
  assertEquals(fetchedPerson.name, ash.name);

  await server.shutdown();
});
