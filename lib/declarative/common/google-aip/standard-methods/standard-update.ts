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
 * standardUpdate is the standard Update operation specification of the resource.
 */
export const standardUpdate: (
  options?: StandardUpdateOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: StandardUpdateOptions) => {
    return [declarativeStandardUpdate(options)];
  },
});

/**
 * standardUpdateOf returns the standard Update operation of the resource.
 */
export function standardUpdateOf<TClass extends Class>(
  target: TClass,
): Operation | undefined {
  return getPrototypeValue<ValueStandardUpdate>(target)?.standardUpdate;
}

/**
 * declarativeStandardUpdate returns the standard Update operation of the resource.
 *
 * @see https://google.aip.dev/134
 */
export function declarativeStandardUpdate<TValue extends ValueStandardUpdate>(
  options?: StandardUpdateOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const schemaRef = `#/components/schemas/${resourceName}`;
    return Object.assign({}, value, {
      standardUpdate: {
        path: `${toPath(name, options)}/{name}`,
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
          parameters: [{ name: "name", in: "path", required: true }],
        },
      },
    });
  };
}

/**
 * StandardUpdateOptions is the options for the standard Update operation of the
 * resource.
 */
export interface StandardUpdateOptions extends OperationOptions {
  request?: { schema?: any; strategy?: "body" | "query" };
}

/**
 * ValueStandardUpdate is the value of the standard Update operation of the resource.
 */
export interface ValueStandardUpdate {
  standardUpdate?: Operation;
}
