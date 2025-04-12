import { assertEquals } from "@std/assert";
import { jsonSchemaOf } from "#/lib/declarative/common/json-schema/json-schema.ts";
import { createAutoSchemaDecoratorFactoryAt } from "./auto-schema.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

@autoSchema()
class Person {
  public constructor(public name: string) {}
}

Deno.test("autoSchema from decorator factory decorates value", () => {
  const personSchema = jsonSchemaOf(Person);
  assertEquals(personSchema.properties.name.type, "string");
  assertEquals(personSchema.required, ["name"]);
  assertEquals(personSchema.type, "object");
});
