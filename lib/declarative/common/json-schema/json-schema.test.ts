import { assertEquals } from "@std/assert";
import { Ajv } from "ajv";
import { createTypeInfoDecoratorFactoryAt } from "#/lib/declarative/common/type-info/type-info.ts";
import { jsonSchema, jsonSchemaOf } from "./json-schema.ts";

const typeInfo = await createTypeInfoDecoratorFactoryAt(import.meta);

@jsonSchema()
@typeInfo()
class Person {
  public constructor(public name: string) {}
}

Deno.test("jsonSchema from decorator factory decorates value", () => {
  const personSchema = jsonSchemaOf(Person);
  assertEquals(personSchema.properties.name.type, "string");
  assertEquals(personSchema.required, ["name"]);
  assertEquals(personSchema.type, "object");
});

@jsonSchema({ properties: { name: { title: "Name" } } })
@typeInfo()
class Person2 {
  public constructor(public name: string) {}
}

Deno.test("jsonSchema from decorator factory decorates masked value", () => {
  const personSchema = jsonSchemaOf(Person2);
  assertEquals(personSchema.properties.name.title, "Name");
  assertEquals(personSchema.properties.name.type, "string");
  assertEquals(personSchema.required, ["name"]);
  assertEquals(personSchema.type, "object");
});

Deno.test("Ajv validates instance", () => {
  const ajv = new Ajv();
  const validate = ajv.compile(
    jsonSchemaOf(Person),
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
