import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type {
  Operation,
  OperationOptions,
} from "#/lib/declarative/common/google-aip/operation.ts";
import { toPath } from "#/lib/declarative/common/google-aip/operation.ts";

/**
 * standardList is the standard List operation specification of the resource.
 */
export const standardList: (
  options?: StandardListOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: StandardListOptions) => {
    return [declarativeStandardList(options)];
  },
});

/**
 * standardListOf returns the standard List operation of the resource.
 */
export function standardListOf<TClass extends Class>(
  target: TClass,
): Operation | undefined {
  return getPrototypeValue<ValueStandardList>(target)?.standardList;
}

/**
 * declarativeStandardList returns the standard List operation of the resource.
 *
 * @see https://google.aip.dev/132
 */
export function declarativeStandardList<TValue extends ValueStandardList>(
  options?: StandardListOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const schemaRef = `#/components/schemas/${resourceName}`;
    if (options?.pagination !== undefined) {
      throw new Error("Pagination is not supported yet.");
    }

    return Object.assign({}, value, {
      standardList: {
        path: toPath(name, options),
        httpMethod: "get",
        schema: {
          parameters: [{ name: "page_size", in: "query" }],
          responses: {
            "200": {
              description: "List of resources.",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: schemaRef },
                  },
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
 * StandardListOptions is the options for the standard List operation of the
 * resource.
 */
export interface StandardListOptions extends OperationOptions {
  /**
   * pagination is the pagination option of the standard List operation of the
   * resource. If left unset, pagination is disabled.
   *
   * @see https://google.aip.dev/158
   */
  pagination?: {
    /**
     * pageSize is the pagination page size.
     */
    pageSize: number;
  };
}

/**
 * ValueStandardList is the value of the standard List operation of the resource.
 */
export interface ValueStandardList {
  standardList?: Operation;
}
