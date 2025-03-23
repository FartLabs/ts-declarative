import { assertEquals } from "@std/assert";
import { Project } from "ts-morph";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { ValueJSONSchema } from "./json-schema.ts";
import { jsonSchemaDecoratorFactory } from "./json-schema.ts";

const project = new Project({ useInMemoryFileSystem: true });
project.createSourceFile(
  import.meta.url,
  await Deno.readTextFile(new URL(import.meta.url)),
);
const jsonSchema = jsonSchemaDecoratorFactory(project);

@jsonSchema(import.meta.url)
class Person {
  public constructor(public name: string) {}
}

Deno.test("jsonSchema from decorator factory decorates value", () => {
  const personSchema = getPrototypeValue<ValueJSONSchema>(Person)?.jsonSchema;
  assertEquals(personSchema.properties.name.type, "string");
  assertEquals(personSchema.required, ["name"]);
  assertEquals(personSchema.type, "object");
});
