import { assert } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { openapiSpec } from "#/lib/declarative/common/openapi/specification.ts";
import { standardMethodsWithDenoKv } from "#/lib/declarative/common/google-aip/deno-kv.ts";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";
import { createOazapftsClientOf, generateOazapftsClientOf } from "./client.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

const kv = await Deno.openKv(":memory:");
const standardMethod = standardMethodsWithDenoKv(kv);

@standardMethod.create()
@standardMethod.get()
@autoSchema()
class Person {
  public constructor(public name: string) {}
}

@openapiSpec({ resources: [Person] })
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

Deno.test("generateOazapftsClientOf dynamic import", async (_t) => {
  const client = await createOazapftsClientOf(App);
  assert(Object.hasOwn(client, "getPeopleByPerson"));
  assert(Object.hasOwn(client, "postPeople"));
});
