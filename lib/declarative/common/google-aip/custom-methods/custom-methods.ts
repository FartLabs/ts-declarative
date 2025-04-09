// deno-lint-ignore-file no-explicit-any

import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type {
  Operation,
  OperationOptions,
} from "#/lib/declarative/common/google-aip/operation.ts";
import { toPath } from "#/lib/declarative/common/google-aip/operation.ts";

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
    if (options?.verb === undefined) {
      throw new Error("verb is required");
    }

    const resourceName = options?.resourceName ?? name;
    const schemaRef = `#/components/schemas/${resourceName}`;
    const path = `${toPath(name, options)}:${options?.verb}`;
    if (value?.customMethods?.some((operation) => operation.path === path)) {
      throw new Error(
        `customMethods "${path}" already exists for resource "${resourceName}"`,
      );
    }

    return Object.assign({}, value, {
      customMethods: [
        ...(value?.customMethods ?? []),
        {
          path,
          httpMethod: options?.httpMethod ?? "post",
          schema: {
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
                    schema: options?.output?.schema ?? { $ref: schemaRef },
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
export interface CustomMethodOptions extends OperationOptions {
  /**
   * verb is the prefix for the custom method. Must be camelCase.
   */
  verb: string;

  /**
   * httpMethod is the HTTP method for the custom method. Defaults to "post".
   */
  httpMethod?: string;

  /**
   * input is the input for the custom method.
   */
  input?: {
    strategy?: "body" | "query";
    schema?: any;
    description?: string;
  };

  /**
   * output is the output for the custom method.
   */
  output?: { schema?: any; description: string };
}

/**
 * ValueCustomMethods is the value of the customMethods operation of the resource.
 */
export interface ValueCustomMethods {
  customMethods?: Operation[];
}
