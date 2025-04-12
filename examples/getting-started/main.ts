// @deno-types="@types/jsonld"
import jsonld from "jsonld";
import { Ajv } from "ajv";
import { createTypeInfoDecoratorFactoryAt } from "#/lib/declarative/common/type-info/type-info.ts";
import {
  jsonSchema,
  jsonSchemaOf,
} from "#/lib/declarative/common/json-schema/mod.ts";
import { context, docOf } from "#/lib/declarative/common/jsonld/mod.ts";

const typeInfo = await createTypeInfoDecoratorFactoryAt(import.meta);

@context("https://schema.org/")
@jsonSchema()
@typeInfo()
class Person {
  public constructor(public name: string) {}
}

// Important: Changes MUST be reflected in README.md section.
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
