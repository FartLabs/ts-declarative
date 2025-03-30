import { assert } from "@std/assert/assert";
import type { QueryEngine } from "@comunica/query-sparql-link-traversal";
import type { Class } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { ValueJSONLd } from "#/lib/declarative/common/jsonld/jsonld.ts";
import type { ValueTsMorph } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
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
  const value = getPrototypeValue<ValueJSONLd & ValueTsMorph>(target);
  if (value === undefined) {
    throw new Error(
      `Class ${target.name} is missing a JSON-LD or ts-morph value.`,
    );
  }

  if (value.context === undefined) {
    throw new Error(`Class ${target.name} is missing a JSON-LD context.`);
  }

  if (value.type === undefined) {
    throw new Error(`Class ${target.name} is missing a JSON-LD type.`);
  }

  if (value.tsMorph === undefined) {
    throw new Error(`Class ${target.name} is missing a ts-morph value.`);
  }

  const [classIDExpanded, ...propertyIDsExpanded] = expandStrings(
    value.context,
    [value.type, ...value.tsMorph.properties.map((property) => property.name)],
  );

  return makeCompliancyQuery(classIDExpanded, propertyIDsExpanded);
}
