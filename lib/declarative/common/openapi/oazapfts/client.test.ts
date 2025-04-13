import { assertSnapshot } from "@std/testing/snapshot";
import { openapi } from "#/lib/declarative/common/openapi/openapi.ts";
import {
  standardCreate,
  standardGet,
} from "#/lib/declarative/common/google-aip/methods/mod.ts";
import { generateOazapftsClientOf } from "./client.ts";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

@standardCreate()
@standardGet()
@autoSchema()
class Person {
  public constructor(public name: string) {}
}

@openapi({ resources: [Person] })
class App {}

Deno.test("generateOazapftsClientOf generates client from OpenAPI specification", async (t) => {
  const sourceCode = await generateOazapftsClientOf(App, { optimistic: true });
  await assertSnapshot(t, sourceCode);
});
