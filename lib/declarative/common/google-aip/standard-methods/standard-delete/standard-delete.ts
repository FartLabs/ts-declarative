import { toCamelCase } from "@std/text/to-camel-case";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { mergeValue } from "#/lib/declarative/merge-value.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type { ValuePathsObject } from "#/lib/declarative/common/openapi/paths-object.ts";
import type { ValueRouterRoutes } from "#/lib/declarative/common/router/router.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
import { toOperationPath } from "#/lib/declarative/common/google-aip/operation.ts";
import type { StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/standard-method-store.ts";
import { standardDeleteHandler } from "./handler.ts";

/**
 * standardDelete is the standard Delete operation specification of the resource.
 *
 * @see https://google.aip.dev/135
 */
export const standardDelete: (
  options?: StandardDeleteOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: initializeStandardDelete,
});

/**
 * initializeStandardDelete returns the standard Delete operation of the resource.
 */
export function initializeStandardDelete(
  options?: StandardDeleteOptions,
): Array<Declarative<ValueStandardDelete>> {
  return [
    declarativeStandardDeleteSpecification(options),
    declarativeStandardDeleteRoute(options),
  ];
}

/**
 * StandardDeleteOptions is the options for the standard Delete operation of
 * the resource.
 */
export interface StandardDeleteOptions
  extends StandardDeleteSpecificationOptions, StandardDeleteRouteOptions {}

/**
 * ValueStandardDelete is the value of the standard Delete operation of the resource.
 */
export interface ValueStandardDelete
  extends ValueJSONSchema, ValuePathsObject, ValueRouterRoutes {}

/**
 * declarativeStandardDeleteSpecification returns the standard Delete
 * operation of the resource.
 */
export function declarativeStandardDeleteSpecification<
  TValue extends ValueStandardDelete,
>(options?: StandardDeleteSpecificationOptions): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const pathname = toStandardDeletePath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );

    return mergeValue(value, {
      paths: {
        [pathname]: {
          delete: {
            description: options?.description ?? `Deletes ${resourceName}`,
            parameters: [
              {
                name: toCamelCase(resourceName),
                in: "path",
                required: true,
              },
            ],
            responses: {
              "200": {
                description: options?.response?.description ??
                  `The deleted ${resourceName}`,
              },
            },
          },
        },
      },
    });
  };
}

/**
 * toStandardDeletePath returns the path of the standard Delete operation of the
 * resource.
 */
export function toStandardDeletePath(
  resourceName: string,
  collectionIdentifier?: string,
  parent?: string,
): string {
  return `${
    toOperationPath(
      resourceName,
      collectionIdentifier,
      parent,
    )
  }/{${toCamelCase(resourceName)}}`;
}

/**
 * StandardDeleteSpecificationOptions is the options for the standard Delete
 * operation of the resource.
 */
export interface StandardDeleteSpecificationOptions extends OperationOptions {}

/**
 * declarativeStandardDeleteRoute returns the standard Delete operation
 * route of the resource.
 */
export function declarativeStandardDeleteRoute<
  TValue extends ValueStandardDelete,
>(options?: StandardDeleteRouteOptions): Declarative<TValue> {
  return (value, name) => {
    if (options?.store === undefined) {
      throw new Error("storage is required");
    }

    const resourceName = options?.resourceName ?? name;
    return mergeValue(value, {
      routes: [
        {
          pattern: toStandardDeletePattern(
            resourceName,
            options.collectionIdentifier,
            options.parent,
          ),
          method: "DELETE",
          handler: standardDeleteHandler(
            options.store,
            [
              ...(options?.prefix ?? []),
              toOperationPath(
                resourceName,
                options.collectionIdentifier,
                options.parent,
              ),
            ],
            toCamelCase(resourceName),
          ),
        },
      ],
    });
  };
}

/**
 * toStandardDeletePattern returns the URL pattern of the standard Delete
 * operation of the resource.
 */
export function toStandardDeletePattern(
  resourceName: string,
  collectionIdentifier?: string,
  parent?: string,
): URLPattern {
  return new URLPattern({
    pathname: `${
      toOperationPath(
        resourceName,
        collectionIdentifier,
        parent,
      )
    }/:${toCamelCase(resourceName)}`,
  });
}

/**
 * StandardDeleteRouteOptions is the options for the standard Delete
 * operation of the resource.
 */
export interface StandardDeleteRouteOptions extends OperationOptions {
  /**
   * store is the persistent storage to use in the HTTP handler.
   */
  store?: StandardMethodStore;

  /**
   * prefix is the prefix used in the key-value storage.
   */
  prefix?: string[];
}
