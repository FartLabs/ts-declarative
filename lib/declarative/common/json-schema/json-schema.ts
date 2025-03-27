import { TypeBoxFromSyntax } from "@sinclair/typemap";
import type { Project } from "ts-morph";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import type { ValueTsMorph } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
import { declarativeTsMorph } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

export interface ValueJSONSchema extends ValueTsMorph {
  // deno-lint-ignore no-explicit-any
  jsonSchema?: any;
}

export function jsonSchemaDecoratorFactory(
  project: Project,
): (specifier: string | URL) => (target: Class) => Class {
  return createDecoratorFactory({
    // TODO: Add another argument to apply custom schema generation.
    initialize: (specifier: URL | string) => {
      const sourceFile = project.getSourceFileOrThrow(specifier.toString());
      return [declarativeTsMorph(sourceFile), declarativeJSONSchema()];
    },
  });
}

export function declarativeJSONSchema<
  TValue extends ValueJSONSchema,
>(): Declarative<TValue> {
  return (value) => {
    if (value === undefined) {
      return;
    }

    return { ...value, jsonSchema: compile(value) };
  };
}

// deno-lint-ignore no-explicit-any
export function compile({ tsMorph }: ValueTsMorph): any {
  return TypeBoxFromSyntax({}, serialize({ tsMorph }));
}

export function serialize({ tsMorph }: ValueTsMorph): string {
  if (tsMorph === undefined || tsMorph?.properties.length === 0) {
    return "{}";
  }

  return `{ ${
    tsMorph.properties
      .map((property) => `"${property.name}": ${property.type}`)
      .join(", ")
  } }`;
}
