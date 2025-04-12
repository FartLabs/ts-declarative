import pluralize from "@wei/pluralize";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type { ValuePathsObject } from "#/lib/declarative/common/openapi/openapi.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
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
 * declarativeStandardList returns the standard List operation of the resource.
 *
 * @see https://google.aip.dev/132
 */
export function declarativeStandardList<TValue extends ValueStandardList>(
  options?: StandardListOptions,
): Declarative<TValue> {
  return (value, name) => {
    if (options?.pagination !== undefined) {
      throw new Error("Pagination is not supported yet.");
    }

    const resourceName = options?.resourceName ?? name;
    const pluralizedResourceName = pluralize(resourceName);
    const pathname = toStandardListPath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );

    value ??= {} as TValue;
    value["paths"] ??= {};
    value["paths"][pathname] ??= {};
    value["paths"][pathname]["get"] = {
      description: options?.description ?? `Lists ${pluralizedResourceName}`,
      parameters: [
        { name: "page_size", in: "query" },
        { name: "page_token", in: "query" },
      ],
      responses: {
        "200": {
          description: options?.response?.description ??
            `List of ${pluralizedResourceName}`,
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
    };

    return value;
  };
}

/**
 * toStandardListPath returns the standard List operation path of the resource.
 */
export function toStandardListPath(
  resourceName: string,
  collectionIdentifier?: string,
  parent?: string,
): string {
  return toOperationPath(resourceName, collectionIdentifier, parent);
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
export interface ValueStandardList extends ValueJSONSchema, ValuePathsObject {}
