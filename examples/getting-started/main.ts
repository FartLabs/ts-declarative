// @deno-types="@types/jsonld"
import jsonld from "jsonld";
import { Ajv } from "ajv";
import { context, docOf } from "#/lib/declarative/common/jsonld/mod.ts";
export type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/mod.ts";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/mod.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@context("http://schema.org/")
@jsonSchema()
export class Person {
  public constructor(public name: string) {}
}

// deno task example
if (import.meta.main) {
  const ash = new Person("Ash Ketchum");
  const expandedAsh = await jsonld.expand(docOf(ash));
  console.log(expandedAsh);
  // Output:
  // [
  //   {
  //     "@type": [ "http://schema.org/Person" ],
  //     "http://schema.org/name": [ { "@value": "Ash Ketchum" } ]
  //   }
  // ]

  const ajv = new Ajv();
  const validate = ajv.compile(
    getPrototypeValue<ValueJSONSchema>(Person)?.jsonSchema,
  );
  const isValid = validate(ash);
  console.log(isValid);
  // Output:
  // true
}
