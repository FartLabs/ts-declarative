import pluralize from "@wei/pluralize";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { mergeValue } from "#/lib/declarative/merge-value.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type { ValuePathsObject } from "#/lib/declarative/common/openapi/paths-object.ts";
import type { ValueRouterRoutes } from "#/lib/declarative/common/router/router.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
import {
  toOperationPath,
  toOperationSchema,
} from "#/lib/declarative/common/google-aip/operation.ts";
import type { StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/standard-method-store.ts";
import { standardListHandler } from "./handler.ts";

/**
 * standardList is the standard List operation specification of the resource.
 *
 * @see https://google.aip.dev/132
 */
export const standardList: (
  options?: StandardListOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: initializeStandardList,
});

/**
 * initializeStandardList returns the standard List operation of the resource.
 */
export function initializeStandardList(
  options?: StandardListOptions,
): Array<Declarative<ValueStandardList>> {
  return [
    declarativeStandardListSpecification(options),
    declarativeStandardListRoute(options),
  ];
}

/**
 * StandardListOptions is the options for the standard List operation of the
 * resource.
 */
export interface StandardListOptions
  extends StandardListSpecificationOptions, StandardListRouteOptions {}

/**
 * ValueStandardList is the value of the standard List operation of the resource.
 */
export interface ValueStandardList
  extends ValueJSONSchema, ValuePathsObject, ValueRouterRoutes {}

/**
 * declarativeStandardListSpecification returns the standard List operation
 * of the resource.
 */
export function declarativeStandardListSpecification<
  TValue extends ValueStandardList,
>(options?: StandardListSpecificationOptions): Declarative<TValue> {
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

    return mergeValue(value, {
      paths: {
        [pathname]: {
          get: {
            description: options?.description ??
              `Lists ${pluralizedResourceName}`,
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
          },
        },
      },
    });
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
export interface StandardListSpecificationOptions extends OperationOptions {
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
 * declarativeStandardListRoute returns the standard List operation of the
 * resource.
 */
export function declarativeStandardListRoute<TValue extends ValueStandardList>(
  options?: StandardListRouteOptions,
): Declarative<TValue> {
  return (value, name) => {
    if (options?.store === undefined) {
      throw new Error("kv is required");
    }

    const resourceName = options?.resourceName ?? name;
    const keyPrefix: Deno.KvKeyPart = toOperationPath(
      resourceName,
      options.collectionIdentifier,
      options.parent,
    );

    return mergeValue(value, {
      routes: [
        {
          pattern: toStandardListPattern(
            resourceName,
            options.collectionIdentifier,
            options.parent,
          ),
          method: "GET",
          handler: standardListHandler(options.store, [
            ...(options?.prefix ?? []),
            keyPrefix,
          ]),
        },
      ],
    });
  };
}

/**
 * StandardListRouteOptions is the options for the standard List operation
 * of the resource.
 */
export interface StandardListRouteOptions
  extends StandardListSpecificationOptions {
  /**
   * store is the persistent storage to use in the HTTP handler.
   */
  store?: StandardMethodStore;

  /**
   * prefix is the prefix used in the key-value storage.
   */
  prefix?: string[];
}

/**
 * toStandardListPattern returns the standard List operation URL pattern of
 * the resource.
 */
export function toStandardListPattern(
  resourceName: string,
  collectionIdentifier?: string,
  parent?: string,
): URLPattern {
  return new URLPattern({
    pathname: toStandardListPath(resourceName, collectionIdentifier, parent),
  });
}
