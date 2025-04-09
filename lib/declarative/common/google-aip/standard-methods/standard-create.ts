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
 * standardCreate is the standard Create operation specification of the resource.
 */
export const standardCreate: (
  options?: StandardCreateOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: StandardCreateOptions) => {
    return [declarativeStandardCreate(options)];
  },
});

/**
 * standardCreateOf returns the standard Create operation of the resource.
 */
export function standardCreateOf<TClass extends Class>(
  target: TClass,
): Operation | undefined {
  return getPrototypeValue<ValueStandardCreate>(target)?.standardCreate;
}

/**
 * declarativeStandardCreate returns the standard Create operation of the resource.
 *
 * @see https://google.aip.dev/133
 */
export function declarativeStandardCreate<TValue extends ValueStandardCreate>(
  options?: StandardCreateOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const schemaRef = `#/components/schemas/${resourceName}`;
    return Object.assign({}, value, {
      standardCreate: {
        path: toPath(name, options),
        httpMethod: "post",
        schema: {
          ...(options?.request?.strategy === "body"
            ? {
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: options?.request?.schema ?? { $ref: schemaRef },
                  },
                },
              },
            }
            : options?.request?.strategy === "query"
            ? {
              query: {
                required: true,
                schema: options?.request?.schema ?? { $ref: schemaRef },
              },
            }
            : {}),
          responses: {
            "200": {
              description: "Created resource.",
              content: {
                "application/json": {
                  schema: { $ref: schemaRef },
                },
              },
            },
          },
        },
      },
    });
  };
}

/**
 * StandardCreateOptions is the options for the standard Create operation of the
 * resource.
 */
export interface StandardCreateOptions extends OperationOptions {
  request?: { schema?: any; strategy?: "body" | "query" };
}

/**
 * ValueStandardCreate is the value of the standard Create operation of the resource.
 */
export interface ValueStandardCreate {
  standardCreate?: Operation;
}
