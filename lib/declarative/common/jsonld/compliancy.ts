import { assert } from "@std/assert/assert";
import type { QueryEngine } from "@comunica/query-sparql-link-traversal";
import type { Class } from "#/lib/declarative/declarative.ts";
import { jsonldOf } from "#/lib/declarative/common/jsonld/jsonld.ts";
import { tsMorphPropertiesOf } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
import { expandStrings } from "./sparql.ts";

/**
 * assertCompliancy asserts that a class is semantically valid.
 */
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

  const tsMorphProperties = tsMorphPropertiesOf(target);
  if (tsMorphProperties === undefined) {
    throw new Error(`Class ${target.name} is missing a ts-morph value.`);
  }

  const properties = tsMorphProperties.map((property) => property.name);
  const [classIDExpanded, ...propertyIDsExpanded] = expandStrings(context, [
    type,
    ...properties,
  ]);

  return makeCompliancyQuery(classIDExpanded, propertyIDsExpanded);
}

/**
 * makeCompliancyQuery makes a SPARQL query that asserts that the given set of
 * properties are included in the given class's domain.
 */
export function makeCompliancyQuery(
  classID: string,
  propertyIDs: string[],
): string {
  return `ASK {
${
    propertyIDs
      .flatMap((propertyID) => {
        return [
          // TODO: Use rdfs:domain instead of schema:domainIncludes.
          // TODO: Check type of propertyID matches TypeScript class property type.
          // TODO: Support subclasses (indirect domainIncludes).
          `<${propertyID}> <https://schema.org/domainIncludes> <${classID}> .`,
        ];
      })
      .join("\n")
  }
}`;
}
