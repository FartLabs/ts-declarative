import { assertSnapshot } from "@std/testing/snapshot";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";
import { OpenAPIServer } from "./openapi.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonSchema()
class Example {
  public constructor(public name: string) {}
}

Deno.test("OpenAPIServer registers class", async (t) => {
  const server = new OpenAPIServer();
  server.register(Example);

  await assertSnapshot(t, JSON.stringify(server.specification, null, 2));
});
