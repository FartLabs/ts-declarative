// deno-lint-ignore-file no-explicit-any

import { deepMerge } from "@std/collections/deep-merge";
import { TypeBoxFromSyntax } from "@sinclair/typemap";
import type { Project } from "ts-morph";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { ValueTypeInfo } from "#/lib/declarative/common/type-info/type-info.ts";
import { declarativeTypeInfo } from "#/lib/declarative/common/type-info/type-info.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

/**
 * jsonSchema is a decorator that sets the JSON Schema of the class.
 */
export function jsonSchemaOf<TClass extends Class>(target: TClass): any {
  return getPrototypeValue<ValueJSONSchema>(target)?.jsonSchema;
}

/**
 * ValueJSONSchema is the interface for the JSON Schema of the class.
 */
export interface ValueJSONSchema extends ValueTypeInfo {
  /**
   * jsonSchema is the JSON Schema of the class.
   */
  jsonSchema?: any;
}

/**
 * jsonSchemaDecoratorFactory creates a decorator factory that decorates a value
 * with a JSON Schema.
 */
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
        declarativeTypeInfo(sourceFile),
        declarativeJSONSchema(maskOrMaskFn0 ?? maskOrMaskFn1),
      ];
    },
  });
}

/**
 * declarativeJSONSchema is a declarative function from JSON Schema.
 */
export function declarativeJSONSchema<TValue extends ValueJSONSchema>(
  maskOrMaskFn?: JSONSchemaMask,
): Declarative<TValue> {
  return (value) => {
    if (value === undefined) {
      return;
    }

    return {
      ...value,
      jsonSchema: applyJSONSchemaMask(compile(value), maskOrMaskFn),
    };
  };
}

/**
 * defaultJSONSchemaMask is our opinionated JSON Schema mask. It adds a title to each
 * property.
 */
export function defaultJSONSchemaMask(value: any): any {
  return {
    properties: Object.fromEntries(
      Object.entries(value.properties).map(([key, _value]) => [
        key,
        { title: key },
      ]),
    ),
  };
}

/**
 * applyJSONSchemaMask applies the JSON Schema mask to the value recursively.
 */
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

/**
 * JSONSchemaMask is a value used to update a JSON Schema value.
 */
export type JSONSchemaMask = any | ((value: any) => any);

/**
 * compile compiles the tsMorph properties into a JSON Schema string.
 */
export function compile({ properties }: ValueTypeInfo): any {
  return TypeBoxFromSyntax({}, serialize({ properties }));
}

/**
 * serialize serializes the tsMorph properties into a JSON Schema string.
 */
export function serialize({ properties }: ValueTypeInfo): string {
  if (properties === undefined) {
    throw new Error(
      "Cannot serialize JSON Schema: properties are undefined or empty.",
    );
  }

  return `{ ${
    properties
      .map((property) => `"${property.name}": ${property.type}`)
      .join(", ")
  } }`;
}
