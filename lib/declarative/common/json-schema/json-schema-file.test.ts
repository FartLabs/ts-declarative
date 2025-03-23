import { assertEquals } from "@std/assert";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { ValueJSONSchema } from "./json-schema.ts";
import { jsonSchemaDecoratorFactoryOfFile } from "./json-schema-file.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonSchema()
class Person {
  public constructor(public name: string) {}
}

Deno.test("jsonSchema from file decorator factory decorates value", () => {
  const personSchema = getPrototypeValue<ValueJSONSchema>(Person)?.jsonSchema;
  assertEquals(personSchema.properties.name.type, "string");
  assertEquals(personSchema.required, ["name"]);
  assertEquals(personSchema.type, "object");
});
