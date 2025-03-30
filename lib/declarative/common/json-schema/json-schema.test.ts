import { assertEquals } from "@std/assert";
import { Ajv } from "ajv";
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

@jsonSchema(import.meta.url, { properties: { name: { title: "Name" } } })
class Person2 {
  public constructor(public name: string) {}
}

Deno.test("jsonSchema from decorator factory decorates masked value", () => {
  const personSchema = getPrototypeValue<ValueJSONSchema>(Person2)?.jsonSchema;
  assertEquals(personSchema.properties.name.title, "Name");
  assertEquals(personSchema.properties.name.type, "string");
  assertEquals(personSchema.required, ["name"]);
  assertEquals(personSchema.type, "object");
});

Deno.test("Ajv validates instance", () => {
  const ajv = new Ajv();
  const validate = ajv.compile(
    getPrototypeValue<ValueJSONSchema>(Person)?.jsonSchema,
  );

  const ash = new Person("Ash Ketchum");
  const isValid0 = validate(ash);
  assertEquals(isValid0, true);
  assertEquals(validate.errors, null);

  const invalidPerson = new Person(0 as unknown as string);
  const isValid1 = validate(invalidPerson);
  assertEquals(isValid1, false);
  assertEquals(validate.errors?.length, 1);
  assertEquals(validate.errors?.at(0)?.keyword, "type");
  assertEquals(validate.errors?.at(0)?.message, "must be string");
});
