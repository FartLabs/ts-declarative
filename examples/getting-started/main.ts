// @deno-types="@types/jsonld"
import jsonld from "jsonld";
import { Ajv } from "ajv";
import { context, docOf } from "#/lib/declarative/common/jsonld/mod.ts";
import {
  jsonSchemaDecoratorFactoryOfFile,
  jsonSchemaOf,
} from "#/lib/declarative/common/json-schema/mod.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@context("https://schema.org/")
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
  //     "@type": "https://schema.org/Person",
  //     "https://schema.org/name": [ { "@value": "Ash Ketchum" } ]
  //   }
  // ]

  const ajv = new Ajv();
  const validate = ajv.compile(jsonSchemaOf(Person));
  const isValid = validate(ash);
  console.log(isValid);
  // Output:
  // true
}
