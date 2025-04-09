// deno-lint-ignore-file no-explicit-any

import { slugify } from "@std/text/unstable-slugify";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { Operation } from "#/lib/declarative/common/openapi/openapi.ts";

/**
 * customMethods is the customMethods operation specification of the resource.
 */
export const customMethods: (
  options?: CustomMethodOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: CustomMethodOptions) => {
    return [declarativeCustomMethods(options)];
  },
});

/**
 * customMethodsOf returns the customMethods operation of the resource.
 */
export function customMethodsOf<TClass extends Class>(
  target: TClass,
): Operation[] | undefined {
  return getPrototypeValue<ValueCustomMethods>(target)?.customMethods;
}

/**
 * declarativeCustomMethods returns the customMethods operation of the resource.
 *
 * @see https://google.aip.dev/136
 */
export function declarativeCustomMethods<TValue extends ValueCustomMethods>(
  options?: CustomMethodOptions,
): Declarative<TValue> {
  return (value, name) => {
    const schemaRef = `#/components/schemas/${options?.resourceName ?? name}`;
    const path = `${options?.parent ?? ""}/${
      options?.resourcePath ?? slugify(name)
    }:${options?.verb}`;
    if (value?.customMethods?.some((operation) => operation.path === path)) {
      throw new Error(
        `customMethods "${path}" already exists for resource "${name}"`,
      );
    }

    return Object.assign({}, value, {
      customMethods: [
        ...(value?.customMethods ?? []),
        {
          path,
          method: "post",
          value: {
            ...(options?.input?.strategy === "body"
              ? {
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: { $ref: schemaRef },
                    },
                  },
                },
              }
              : options?.input?.strategy === "query"
              ? {
                query: {
                  required: true,
                  schema: { $ref: schemaRef },
                },
              }
              : {}),
            responses: {
              "200": {
                description: "Executes an operation on a resource.",
                content: {
                  "application/json": {
                    schema: options?.output?.jsonSchema ?? { $ref: schemaRef },
                  },
                },
              },
            },
          },
        },
      ],
    });
  };
}

/**
 * CustomMethodOptions is the options for the customMethods operation of the
 * resource.
 */
export interface CustomMethodOptions {
  /**
   * parent is the parent of the resource.
   */
  parent?: string;

  /**
   * resourcePath is the path of the resource.
   */
  resourcePath?: string;

  /**
   * resourceName is the name of the resource.
   */
  resourceName?: string;

  /**
   * verb is the prefix for the custom method. Must be camelCase.
   */
  verb?: string;

  /**
   * input is the input for the custom method.
   */
  input?: { jsonSchema?: any; strategy?: "body" | "query" };

  /**
   * output is the output for the custom method.
   */
  output?: { jsonSchema?: any };
}

/**
 * ValueCustomMethods is the value of the customMethods operation of the resource.
 */
export interface ValueCustomMethods {
  customMethods?: Operation[];
}
