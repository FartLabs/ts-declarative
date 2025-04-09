// deno-lint-ignore-file no-explicit-any

import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import { toCollectionIdentifier } from "#/lib/declarative/common/google-aip/to-collection-identifier.ts";
import type { Operation } from "#/lib/declarative/common/openapi/openapi.ts";

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
    const schemaRef = `#/components/schemas/${options?.resourceName ?? name}`;
    return Object.assign({}, value, {
      standardUpdate: {
        path: `${options?.parent ?? ""}/${
          options?.collectionIdentifier ?? toCollectionIdentifier(name)
        }/{name}`,
        httpMethod: "post",
        specification: {
          ...(options?.input?.strategy === "body"
            ? {
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: options?.input?.jsonSchema ?? { $ref: schemaRef },
                  },
                },
              },
            }
            : options?.input?.strategy === "query"
            ? {
              query: {
                required: true,
                schema: options?.input?.jsonSchema ?? { $ref: schemaRef },
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
export interface StandardUpdateOptions {
  parent?: string;
  collectionIdentifier?: string;
  resourceName?: string;
  input?: { jsonSchema?: any; strategy?: "body" | "query" };
}

/**
 * ValueStandardUpdate is the value of the standard Update operation of the resource.
 */
export interface ValueStandardUpdate {
  standardUpdate?: Operation;
}
