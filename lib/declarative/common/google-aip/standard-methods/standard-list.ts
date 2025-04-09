import pluralize from "@wei/pluralize";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type {
  Operation,
  OperationOptions,
  OperationResponse,
} from "#/lib/declarative/common/google-aip/operation.ts";
import {
  toOperationPath,
  toOperationSchema,
} from "#/lib/declarative/common/google-aip/operation.ts";

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
    if (options?.pagination !== undefined) {
      throw new Error("Pagination is not supported yet.");
    }

    return Object.assign({}, value, {
      standardList: {
        path: toOperationPath(
          name,
          options?.collectionIdentifier,
          options?.parent,
        ),
        httpMethod: "get",
        description: options?.description ?? `Lists ${pluralize(resourceName)}`,
        schema: {
          parameters: [
            { name: "page_size", in: "query" },
            { name: "page_token", in: "query" },
          ],
          responses: {
            "200": {
              description: options?.response?.description ??
                `List of ${pluralize(resourceName)}`,
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: toOperationSchema(
                      resourceName,
                      value?.jsonSchema,
                      options?.response?.schema,
                    ),
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

  /**
   * response is the response option of the standard List operation of the
   * resource.
   */
  response?: OperationResponse;
}

/**
 * ValueStandardList is the value of the standard List operation of the resource.
 */
export interface ValueStandardList extends ValueJSONSchema {
  standardList?: Operation;
}
