import { QueryEngine } from "@comunica/query-sparql-link-traversal";

// TODO: Assert the given set of triples is compliant with the given data source.
// export function assertCompliant(){}

// deno -A lib/declarative/common/jsonld/compliant.ts
if (import.meta.main) {
  console.log("Creating query engine.");
  const engine = new QueryEngine();

  console.log("Querying data source.");
  const result = await engine.queryBoolean(
    `
PREFIX schema: <http://schema.org/>

ASK {
  # TODO: Check conformance of properties in schema:Person.
}
`,
    { lenient: true },
  );

  console.log({ result });
}
