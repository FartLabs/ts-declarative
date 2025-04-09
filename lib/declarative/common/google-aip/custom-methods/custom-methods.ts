// deno-lint-ignore-file no-explicit-any

import { slugify } from "@std/text/unstable-slugify";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { Operation } from "#/lib/declarative/common/openapi/openapi.ts";

/**
 * customMethod is a decorator factory that creates a custom method for the
 * resource.
 */
export const customMethod: (
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
    const path = customMethodPath(options);
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
          httpMethod: options?.httpMethod ?? "post",
          specification: {
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
                description: options?.output?.description,
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
 * customMethodPath returns the path for the custom method.
 */
export function customMethodPath(options?: CustomMethodOptions): string {
  return `${options?.parent ?? ""}/${
    options?.resourcePath ?? slugify(options?.resourceName ?? "")
  }:${options?.verb}`;
}

/**
 * CustomMethodOptions is the options for the customMethods operation of the
 * resource.
 */
export interface CustomMethodOptions {
  /**
   * verb is the prefix for the custom method. Must be camelCase.
   */
  verb: string;

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
   * httpMethod is the HTTP method for the custom method. Defaults to "post".
   */
  httpMethod?: string;

  /**
   * input is the input for the custom method.
   */
  input?: {
    strategy?: "body" | "query";
    jsonSchema?: any;
    description?: string;
  };

  /**
   * output is the output for the custom method.
   */
  output?: { jsonSchema?: any; description: string };
}

/**
 * ValueCustomMethods is the value of the customMethods operation of the resource.
 */
export interface ValueCustomMethods {
  customMethods?: Operation[];
}
