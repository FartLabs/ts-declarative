// deno-lint-ignore-file no-explicit-any

import { deepMerge } from "@std/collections/deep-merge";
import { TypeBoxFromSyntax } from "@sinclair/typemap";
import type { Project } from "ts-morph";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { ValueTsMorph } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
import { declarativeTsMorph } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

export function jsonSchemaOf<TClass extends Class>(target: TClass): any {
  return getPrototypeValue<ValueJSONSchema>(target)?.jsonSchema;
}

export interface ValueJSONSchema extends ValueTsMorph {
  jsonSchema?: any;
}

export function jsonSchemaDecoratorFactory(
  project: Project,
  maskOrMaskFn1?: JSONSchemaMask,
): (
  specifier: string | URL,
  maskOrMaskFn?: JSONSchemaMask,
) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: (specifier, maskOrMaskFn0) => {
      const sourceFile = project.getSourceFileOrThrow(specifier.toString());
      return [
        declarativeTsMorph(sourceFile),
        declarativeJSONSchema(maskOrMaskFn0 ?? maskOrMaskFn1),
      ];
    },
  });
}

export function declarativeJSONSchema<TValue extends ValueJSONSchema>(
  maskOrMaskFn?: JSONSchemaMask,
): Declarative<TValue> {
  return (value) => {
    if (value === undefined) {
      return;
    }

    return Object.assign(value, {
      jsonSchema: applyJSONSchemaMask(compile(value), maskOrMaskFn),
    });
  };
}

export function opinionatedJSONSchemaMask(value: any): any {
  return {
    properties: Object.fromEntries(
      Object.entries(value.properties).map(([key, _value]) => [
        key,
        { title: key },
      ]),
    ),
  };
}

export function applyJSONSchemaMask(
  value: any,
  maskOrMaskFn?: JSONSchemaMask,
): any {
  const mask = typeof maskOrMaskFn === "function"
    ? maskOrMaskFn(value)
    : maskOrMaskFn;
  if (mask === undefined) {
    return value;
  }

  return deepMerge(value, mask);
}

export type JSONSchemaMask = any | ((value: any) => any);

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
