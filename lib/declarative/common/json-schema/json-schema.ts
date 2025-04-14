// deno-lint-ignore-file no-explicit-any

import { deepMerge } from "@std/collections/deep-merge";
import { TypeBoxFromSyntax } from "@sinclair/typemap";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { ValueTypeInfo } from "#/lib/declarative/common/type-info/type-info.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

/**
 * jsonSchema is a decorator that sets the JSON Schema of the class.
 */
export function jsonSchemaOf(target: Class): any {
  return getPrototypeValue<ValueJSONSchema>(target)?.jsonSchema;
}

/**
 * jsonSchema is a decorator that sets the JSON Schema of the class.
 */
export const jsonSchema: (
  mask?: JSONSchemaMask,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (mask: JSONSchemaMask = defaultJSONSchemaMask) => {
    return [declarativeJSONSchema(mask)];
  },
});

/**
 * createJSONSchemaDecoratorFactory creates a decorator factory that decorates
 * a value with a JSON Schema.
 */
export function createJSONSchemaDecoratorFactory(
  mask1?: JSONSchemaMask,
): (
  specifier: string | URL,
  mask?: JSONSchemaMask,
) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: (mask0?: JSONSchemaMask) => {
      return [declarativeJSONSchema(mask0 ?? mask1)];
    },
  });
}

/**
 * declarativeJSONSchema is a declarative function from JSON Schema.
 */
export function declarativeJSONSchema<TValue extends ValueJSONSchema>(
  mask?: JSONSchemaMask,
): Declarative<TValue> {
  return (value) => {
    if (value === undefined) {
      return;
    }

    return {
      ...value,
      jsonSchema: applyJSONSchemaMask(compile(value), mask),
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
  maskOrFn?: JSONSchemaMask,
): any {
  const mask = typeof maskOrFn === "function" ? maskOrFn(value) : maskOrFn;
  if (mask === undefined) {
    return value;
  }

  return deepMerge(value, mask);
}

// TODO: Migrate TypeBox logic to auto-schema.

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

/**
 * JSONSchemaMask is a value used to update a JSON Schema value.
 */
export type JSONSchemaMask = any | ((value: any) => any);

/**
 * ValueJSONSchema is the interface for the JSON Schema of the class.
 */
export interface ValueJSONSchema extends ValueTypeInfo {
  /**
   * jsonSchema is the JSON Schema of the class.
   */
  jsonSchema?: any;
}
