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
  const query = await generateCompliancyQueryFromClass(target);
  const isCompliant = await queryEngine.queryBoolean(query);
  assert(isCompliant, `Class ${target.name} is not compliant.`);
}

export async function expandStrings(
  context: Context,
  strings: string[],
): Promise<string[]> {
  // console.log({ expandStrings: { context, strings } });
  const expanded = await jsonldjs.expand(
    Object.assign(
      { "@context": context },
      ...strings.map((key, i) => ({ [key]: i })),
    ),
  );
  if (expanded.length !== 1) {
    throw new Error("Failed to expand keys.");
  }

  return Object.entries(expanded[0] as Record<string, { "@value": number }>)
    .toSorted(([, a], [, b]) => a["@value"] - b["@value"])
    .map(([key]) => key);
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
    prepareSchemaOrgContext(context),
    [classID, ...propertyIDs].map((id) => prepareSchemaOrgID(id)),
  );
  return makeCompliancyQuery(classIDExpanded, propertyIDsExpanded);
}

/**
 * makeCompliancyQuery makes a SPARQL query that asserts that the given set of
 * properties are included in the given class's domain.
 */
export function makeCompliancyQuery(classID: string, propertyIDs: string[]) {
  console.log({ makeCompliancyQuery: { classID, propertyIDs } });
  return `ASK {
${
    propertyIDs
      .flatMap((propertyID) => {
        return [
          // TODO: Test rdfs:domain instead of schema:domainIncludes.
          // TODO: Check type of propertyID matches TypeScript class property type.
          `<${propertyID}> <https://schema.org/domainIncludes> <${classID}> .`,
        ];
      })
      .join("\n")
  }
}`;
}

export function prepareSchemaOrgID(id: string): string {
  return id.replace(/^http:\/\/schema.org\//, "https://schema.org/");
}

export function prepareSchemaOrgContext(context: Context): Context {
  const after = JSON.parse(
    JSON.stringify(context).replaceAll(
      "http://schema.org/",
      "https://schema.org/",
    ),
  );

  console.log({ before: context, after });
  return after;
}
