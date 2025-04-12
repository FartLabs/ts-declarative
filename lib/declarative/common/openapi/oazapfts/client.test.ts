import { assertSnapshot } from "@std/testing/snapshot";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";
import {
  standardCreate,
  standardGet,
} from "#/lib/declarative/common/google-aip/methods/mod.ts";
import { openapi } from "#/lib/declarative/common/openapi/openapi.ts";
import { generateOazapftsClientOf } from "./client.ts";

// TODO: Rename to something like jsonSchemaDecoratorFactory(typeInfo);
const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@standardCreate()
@standardGet()
@jsonSchema()
class Person {
  public constructor(public name: string) {}
}

@openapi({
  specification: {
    openapi: "3.0.1",
    info: { title: "App", version: "0.0.1" },
    components: {},
  },
  resources: [Person],
})
class App {}

Deno.test("oazapfts decorator decorates value", async (t) => {
  const sourceCode = await generateOazapftsClientOf(App);
  await assertSnapshot(t, sourceCode);
});
