import { QueryEngine } from "@comunica/query-sparql-link-traversal";
import { jsonld } from "#/lib/declarative/common/jsonld/jsonld.ts";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";
import {
  assertCompliancy,
  makeCompliancyQueryFromClass,
} from "./compliancy.ts";
import { assertEquals } from "@std/assert/equals";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonld({ context: "https://schema.org/" })
@jsonSchema()
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
