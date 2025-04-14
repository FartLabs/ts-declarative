// @deno-types="@types/jsonld"
import jsonld from "jsonld";
import { context, docOf } from "#/lib/declarative/common/jsonld/mod.ts";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";
import { validate } from "#/lib/declarative/common/json-schema/ajv/ajv.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

@context("https://schema.org/")
@autoSchema()
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

  const isValid = validate(ash);
  console.log(isValid);
  // Output:
  // true
}
