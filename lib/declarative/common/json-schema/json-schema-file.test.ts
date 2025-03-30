import { assertEquals } from "@std/assert";
import { jsonSchemaDecoratorFactoryOfFile } from "./json-schema-file.ts";
import { jsonSchemaOf } from "./json-schema.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonSchema()
class Person {
  public constructor(public name: string) {}
}

Deno.test("jsonSchema from file decorator factory decorates value", () => {
  const personSchema = jsonSchemaOf(Person);
  assertEquals(personSchema.properties.name.type, "string");
  assertEquals(personSchema.required, ["name"]);
  assertEquals(personSchema.type, "object");
});
