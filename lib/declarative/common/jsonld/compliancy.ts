import { assert } from "@std/assert/assert";
// @deno-types="npm:@types/jsonld"
import { default as jsonldjs } from "jsonld";
import type { QueryEngine } from "@comunica/query-sparql-link-traversal";
import type { Class } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { Context } from "#/lib/declarative/common/jsonld/context.ts";
import type { ValueJSONLd } from "#/lib/declarative/common/jsonld/jsonld.ts";
import type { ValueTsMorph } from "#/lib/declarative/common/ts-morph/ts-morph.ts";

export async function assertCompliancy(
  queryEngine: QueryEngine,
  target: Class,
) {
  const value = getPrototypeValue<ValueJSONLd & ValueTsMorph>(target);
  if (value === undefined) {
    throw new Error(
      `Class ${target.name} is missing a JSON-LD or ts-morph value.`,
    );
  }

  const typeID = (await expandKeys(value.context!, [value.type!.at(0)!])).at(
    0,
  )!;
  if (typeID === undefined) {
    throw new Error(`Type does not exist.`);
  }

  const propertyIDs = await expandKeys(
    value.context!,
    value.tsMorph!.properties.map((property) => property.name),
  );
  if (propertyIDs === undefined) {
    throw new Error(`Property does not exist.`);
  }

  // TODO: Expand keys in makeCompliancyQuery generation procedure.
  const query = makeCompliancyQuery(typeID, propertyIDs);
  const isCompliant = await queryEngine.queryBoolean(query);
  assert(isCompliant, `Class ${target.name} is not compliant.`);
}

export async function expandKeys(
  context: Context,
  keys: string[],
): Promise<string[]> {
  const expanded = await jsonldjs.expand({
    "@context": context,
    ...Object.fromEntries(keys.map((key) => [key, ""])),
  });
  return Object.keys(expanded);
}

/**
 * makeCompliancyQuery makes a SPARQL query that asserts that the given set of
 * properties are included in the given class's domain.
 */
export function makeCompliancyQuery(classID: string, propertyIDs: string[]) {
  return `ASK {
${
    propertyIDs
      .flatMap((propertyID) => {
        return [
          `<${propertyID}> <https://schema.org/domainIncludes> <${classID}> .`,
        ];
      })
      .join("\n")
  }
}`;
}
