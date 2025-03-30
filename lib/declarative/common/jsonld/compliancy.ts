import { assert } from "@std/assert/assert";
import type { QueryEngine } from "@comunica/query-sparql-link-traversal";
import type { Class } from "#/lib/declarative/declarative.ts";
import { jsonldOf } from "#/lib/declarative/common/jsonld/jsonld.ts";
import { tsMorphOf } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
import { expandStrings, makeCompliancyQuery } from "./sparql.ts";

export async function assertCompliancy(
  queryEngine: QueryEngine,
  target: Class,
) {
  const query = makeCompliancyQueryFromClass(target);
  const isCompliant = await queryEngine.queryBoolean(query);
  assert(isCompliant, `Class ${target.name} is not compliant.`);
}

/**
 * makeCompliancyQueryFromClass generates a SPARQL query from a class.
 */
export function makeCompliancyQueryFromClass(target: Class): string {
  const { type, context } = jsonldOf(target) ?? {};
  if (type === undefined) {
    throw new Error(`Class ${target.name} is missing a JSON-LD type.`);
  }

  if (context === undefined) {
    throw new Error(`Class ${target.name} is missing a JSON-LD context.`);
  }

  const tsMorph = tsMorphOf(target);
  if (tsMorph === undefined) {
    throw new Error(`Class ${target.name} is missing a ts-morph value.`);
  }
  const properties = tsMorph.properties.map((property) => property.name);
  const [classIDExpanded, ...propertyIDsExpanded] = expandStrings(
    context,
    [type, ...properties],
  );

  return makeCompliancyQuery(classIDExpanded, propertyIDsExpanded);
}
