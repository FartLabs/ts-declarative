import { QueryEngine } from "@comunica/query-sparql-link-traversal";
import { createTypeInfoDecoratorFactoryAt } from "#/lib/declarative/common/type-info/type-info.ts";
import { jsonld } from "#/lib/declarative/common/jsonld/jsonld.ts";
import {
  assertCompliancy,
  makeCompliancyQuery,
  makeCompliancyQueryFromClass,
} from "./compliancy.ts";
import { assertEquals } from "@std/assert/equals";

const typeInfo = await createTypeInfoDecoratorFactoryAt(import.meta);

@jsonld({ context: "https://schema.org/" })
@typeInfo()
class Person {
  public constructor(public givenName: string, public familyName: string) {}
}

// TODO: Migrate to query engine that does not require access to the Internet.
const queryEngine = new QueryEngine();

Deno.test("assertCompliancy asserts class is compliant", async () => {
  await assertCompliancy(queryEngine, Person);
});

Deno.test("makeCompliancyQueryFromClass makes a valid query", () => {
  const query = makeCompliancyQueryFromClass(Person);
  assertEquals(
    query,
    `ASK {
<https://schema.org/givenName> <https://schema.org/domainIncludes> <https://schema.org/Person> .
<https://schema.org/familyName> <https://schema.org/domainIncludes> <https://schema.org/Person> .
}`,
  );
});

Deno.test("makeCompliancyQuery makes a valid query", () => {
  const query = makeCompliancyQuery("https://schema.org/Person", [
    "https://schema.org/givenName",
    "https://schema.org/familyName",
  ]);
  assertEquals(
    query,
    `ASK {
<https://schema.org/givenName> <https://schema.org/domainIncludes> <https://schema.org/Person> .
<https://schema.org/familyName> <https://schema.org/domainIncludes> <https://schema.org/Person> .
}`,
  );
});
