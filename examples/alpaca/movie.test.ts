import { QueryEngine } from "@comunica/query-sparql-link-traversal";
import { assertCompliancy } from "#/lib/declarative/common/jsonld/compliancy.ts";
import { Movie } from "./movie.ts";

const queryEngine = new QueryEngine();

Deno.test("Movie is compliant", async () => {
  await assertCompliancy(queryEngine, Movie);
});
