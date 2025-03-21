// @deno-types="@types/jsonld"
import jsonld from "jsonld";
import { context, docOf } from "#/lib/declarative/common/linked-data/mod.ts";

@context("https://schema.org/")
export class Person {
  public constructor(public name: string) {}
}

@context("https://schema.org/")
// @type("Person") // TODO: Chain decorators.
export class AliasedPerson {
  public constructor(public name: string) {}
}

// deno -A examples/getting-started/main.ts
if (import.meta.main) {
  const ash = new Person("Ash Ketchum");
  const docAsh = docOf(ash);
  const expandedAsh = await jsonld.expand(docAsh);
  console.log(expandedAsh);
  // Output:
  // [
  //   {
  //     "@type": [ "http://schema.org/Person" ],
  //     "http://schema.org/name": [ { "@value": "Ash Ketchum" } ]
  //   }
  // ]
}
