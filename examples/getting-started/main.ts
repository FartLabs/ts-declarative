// @deno-types="@types/jsonld"
import jsonld from "jsonld";
import {
  context,
  docOf,
  type,
} from "#/lib/declarative/common/linked-data/mod.ts";

@context("https://schema.org/")
export class Person {
  public constructor(public name: string) {}
}

@context("https://schema.org/")
@type("Person")
export class AliasedPerson {
  public constructor(public name: string) {}
}

// deno -A examples/getting-started/main.ts
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
}

// TODO: Add tests for all declaratives.
