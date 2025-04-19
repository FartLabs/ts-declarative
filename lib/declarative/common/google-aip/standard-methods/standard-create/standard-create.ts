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
import { createValidator } from "#/lib/declarative/common/json-schema/ajv/ajv.ts";
import type { StandardMethodStorage } from "#/lib/declarative/common/google-aip/standard-methods/common/storage/standard-method-storage.ts";
import { standardCreateHandler } from "./handler.ts";

/**
 * standardCreate is the standard Create operation specification of the resource.
 *
 * @see https://google.aip.dev/133
 */
export const standardCreate: (
  options?: StandardCreateOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: initializeStandardCreate,
});

/**
 * initializeStandardCreate returns the standard Create operation of the resource.
 */
export function initializeStandardCreate(
  options?: StandardCreateOptions,
): Array<Declarative<ValueStandardCreate>> {
  return [
    declarativeStandardCreateSpecification(options),
    declarativeStandardCreateRoute(options),
  ];
}

/**
 * StandardCreateOptions is the options for the standard Create operation of the
 * resource.
 */
export interface StandardCreateOptions
  extends StandardCreateSpecificationOptions, StandardCreateRouteOptions {}

/**
 * ValueStandardCreate is the value of the standard Create operation of the resource.
 */
export interface ValueStandardCreate
  extends ValueJSONSchema, ValuePathsObject, ValueRouterRoutes {}

/**
 * declarativeStandardCreateSpecification returns the standard Create
 * operation of the resource.
 */
export function declarativeStandardCreateSpecification<
  TValue extends ValueStandardCreate,
>(options?: StandardCreateSpecificationOptions): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const pathname = toStandardCreatePath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );

    return mergeValue(value, {
      paths: {
        [pathname]: {
          post: {
            description: options?.description ?? `Creates ${resourceName}`,
            requestBody: {
              required: true,
              description: options?.request?.description ??
                `The ${resourceName} to create`,
              content: {
                "application/json": {
                  schema: toOperationSchema(
                    resourceName,
                    value?.jsonSchema,
                    options?.request?.schema,
                  ),
                },
              },
            },
            responses: {
              "200": {
                description: options?.response?.description ??
                  `The created ${resourceName}`,
                content: {
                  "application/json": {
                    schema: toOperationSchema(
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
 * toStandardCreatePath returns the path of the standard Create operation of the
 * resource.
 */
export function toStandardCreatePath(
  resourceName: string,
  collectionIdentifier?: string,
  parent?: string,
): string {
  return toOperationPath(resourceName, collectionIdentifier, parent);
}

/**
 * StandardCreateSpecificationOptions is the options for the standard Create
 * operation of the resource.
 */
export interface StandardCreateSpecificationOptions extends OperationOptions {}

/**
 * declarativeStandardCreateRoute returns the standard Create operation
 * route of the resource.
 */
export function declarativeStandardCreateRoute<
  TValue extends ValueStandardCreate,
>(options?: StandardCreateRouteOptions): Declarative<TValue> {
  return (value, name) => {
    if (options?.storage === undefined) {
      throw new Error("storage is required");
    }

    const resourceName = options?.resourceName ?? name;
    const keyPrefix = toOperationPath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );
    const validator = value?.jsonSchema !== undefined
      ? createValidator(value?.jsonSchema)
      : undefined;

    return mergeValue(value, {
      routes: [
        {
          pattern: toStandardCreatePattern(
            resourceName,
            options?.collectionIdentifier,
            options?.parent,
          ),
          method: "POST",
          handler: standardCreateHandler(
            options.storage,
            [keyPrefix],
            options?.primaryKey,
            validator,
          ),
        },
      ],
    });
  };
}

/**
 * StandardCreateRouteOptions is the options for the standard Create HTTP route
 * of the resource.
 */
export interface StandardCreateRouteOptions extends OperationOptions {
  /**
   * storage is the persistent storage to use in the HTTP handler.
   */
  storage?: StandardMethodStorage;

  /**
   * validation is whether the request should be validated.
   */
  // deno-lint-ignore no-explicit-any
  validator?: (data: any) => boolean;

  /**
   * primaryKey is the primary key of the resource.
   */
  primaryKey?: string;
}

/**
 * toStandardCreatePattern returns the URL pattern of the standard Create
 * operation of the resource.
 */
export function toStandardCreatePattern(
  resourceName: string,
  collectionIdentifier?: string,
  parent?: string,
): URLPattern {
  return new URLPattern({
    pathname: toStandardCreatePath(resourceName, collectionIdentifier, parent),
  });
}
