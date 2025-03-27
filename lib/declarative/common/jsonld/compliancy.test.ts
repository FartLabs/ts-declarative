import { assertSnapshot } from "@std/testing/snapshot";
// import { QueryEngine } from "@comunica/query-sparql-link-traversal";
// import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";
// import { jsonld } from "./jsonld.ts";
import { makeCompliancyQuery } from "./compliancy.ts";

// const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

// @jsonld({ context: "https://schema.org/" })
// @jsonSchema()
// class Person {
//   public constructor(public name: string) {}
// }

// const queryEngine = new QueryEngine();

Deno.test("makeCompliancyQuery makes query", async (t) => {
  const query = makeCompliancyQuery("https://schema.org/Person", [
    "https://schema.org/name",
  ]);

  await assertSnapshot(t, query);
});

// TODO: Test compliancy assertion.
// Deno.test("assertCompliancy asserts class is compliant", async () => {
//   await assertCompliancy(queryEngine, Person);
// });
