import { assert } from "@std/assert/assert";
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
  const query = await generateCompliancyQueryFromClass(target);
  const isCompliant = await queryEngine.queryBoolean(query);
  assert(isCompliant, `Class ${target.name} is not compliant.`);
}

export function expandStrings(context: Context, strings: string[]): string[] {
  const prefixes = getPrefixesFromContext(context);
  return strings.map((value) => {
    const prefixIndex = value.indexOf(":");
    const prefix = value.slice(0, prefixIndex + 1);
    const suffix = value.slice(prefixIndex + 1);
    if (prefix === "" && prefixes.has(suffix)) {
      return prefixes.get(suffix)!;
    }

    const replacement = prefixes.get(prefix);
    if (replacement === undefined) {
      return value;
    }

    return `${replacement}${suffix}`;
  });
}

/**
 * getPrefixesFromContext returns the prefixes from a JSON-LD context.
 *
 * This function only supports the "@vocab" key and the top-level keys for simplicity.
 * Therefore, it won't work for every JSON-LD context.
 */
function getPrefixesFromContext(context: Context): Map<string, string> {
  const prefixes = new Map<string, string>();
  if (typeof context === "string") {
    prefixes.set("", context);
    return prefixes;
  }

  if (context["@vocab"] !== undefined) {
    prefixes.set("", context["@vocab"]);
  }

  for (const [key, value] of Object.entries(context)) {
    if (key.startsWith("@")) {
      continue;
    }

    prefixes.set(key, value);
  }

  return prefixes;
}

/**
 * generateCompliancyQueryFromClass generates a SPARQL query from a class.
 */
export async function generateCompliancyQueryFromClass(
  target: Class,
): Promise<string> {
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

  return await generateCompliancyQuery(
    value.context,
    value.type,
    value.tsMorph.properties.map((property) => property.name),
  );
}

/**
 * generateCompliancyQuery generates a SPARQL query from unexpanded keys.
 */
export async function generateCompliancyQuery(
  context: Context,
  classID: string,
  propertyIDs: string[],
): Promise<string> {
  const [classIDExpanded, ...propertyIDsExpanded] = await expandStrings(
    context,
    [classID, ...propertyIDs],
  );
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
