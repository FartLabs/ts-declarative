import { TypeBoxFromSyntax } from "@sinclair/typemap";
import type { Declarative } from "#/lib/declarative/declarative.ts";
import type { ValueTsMorph } from "#/lib/declarative/common/ts-morph/ts-morph.ts";

export interface ValueJSONSchema extends ValueTsMorph {
  // deno-lint-ignore no-explicit-any
  jsonSchema?: any;
}

export function declarativeJSONSchema<
  TValue extends ValueJSONSchema,
>(): Declarative<TValue> {
  return (value) => {
    return { ...value, jsonSchema: compile(value) };
  };
}

export function compile({ tsMorph }: ValueTsMorph) {
  return TypeBoxFromSyntax({}, serialize({ tsMorph }));
}

export function serialize({ tsMorph }: ValueTsMorph): string {
  if (tsMorph === undefined || tsMorph?.properties.length === 0) {
    return `{}`;
  }

  return `{ ${
    tsMorph.properties
      .map((property) => `"${property.name}": ${property.type}`)
      .join(", ")
  } }`;
}
