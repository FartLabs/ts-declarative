import { assertEquals } from "@std/assert";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";
import { standardGet, standardGetOf } from "./standard-get.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@standardGet({ path: "/persons" })
@jsonSchema()
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardGet decorator factory decorates value", () => {
  const actual = standardGetOf(Person);
  assertEquals(actual, {
    path: "/persons/{name}",
    operation: {
      parameters: [{ name: "name", in: "path", required: true }],
    },
  });
});
