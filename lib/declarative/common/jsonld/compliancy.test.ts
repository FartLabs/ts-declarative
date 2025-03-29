import { QueryEngine } from "@comunica/query-sparql-link-traversal";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";
import { jsonld } from "#/lib/declarative/common/jsonld/jsonld.ts";
import {
  assertCompliancy,
  expandStrings,
  generateCompliancyQuery,
  generateCompliancyQueryFromClass,
  makeCompliancyQuery,
} from "./compliancy.ts";
import { assertEquals } from "@std/assert/equals";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonld({ context: "https://schema.org/" })
@jsonSchema()
class Person {
  public constructor(public givenName: string, public familyName: string) {}
}

const queryEngine = new QueryEngine();

Deno.test("assertCompliancy asserts class is compliant", async () => {
  await assertCompliancy(queryEngine, Person);
});

Deno.test("generateCompliancyQueryFromClass makes a valid query", async () => {
  const query = await generateCompliancyQueryFromClass(Person);
  assertEquals(
    query,
    `ASK {
<https://schema.org/givenName> <https://schema.org/domainIncludes> <https://schema.org/Person> .
<https://schema.org/familyName> <https://schema.org/domainIncludes> <https://schema.org/Person> .
}`,
  );
});

Deno.test("generateCompliancyQuery generates a valid query", async () => {
  const query = await generateCompliancyQuery(
    "https://schema.org/",
    "https://schema.org/Person",
    ["https://schema.org/givenName", "https://schema.org/familyName"],
  );
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

Deno.test("expandStrings expands strings correctly", () => {
  const expanded = expandStrings("https://schema.org/", [
    "givenName",
    "familyName",
    "https://example.org/example",
  ]);
  assertEquals(expanded, [
    "https://schema.org/givenName",
    "https://schema.org/familyName",
    "https://example.org/example",
  ]);
});
