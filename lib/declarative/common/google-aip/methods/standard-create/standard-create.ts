import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type { ValuePathsObject } from "#/lib/declarative/common/openapi/paths-object.ts";
import type { ValueRouterRoutes } from "#/lib/declarative/common/router/router.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
import {
  toOperationPath,
  toOperationSchema,
} from "#/lib/declarative/common/google-aip/operation.ts";
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

    value ??= {} as TValue;
    value["paths"] ??= {};
    value["paths"][pathname] ??= {};
    value["paths"][pathname]["post"] = {
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
    };

    return value;
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
    if (options?.kv === undefined) {
      throw new Error("kv is required");
    }

    const resourceName = options?.resourceName ?? name;
    const keyPrefix: Deno.KvKeyPart = toOperationPath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );

    value ??= {} as TValue;
    value["routes"] ??= [];
    value["routes"].push({
      pattern: toStandardCreatePattern(
        resourceName,
        options?.collectionIdentifier,
        options?.parent,
      ),
      method: "POST",
      handler: standardCreateHandler(options.kv, [keyPrefix]),
    });
    return value;
  };
}

/**
 * StandardCreateRouteOptions is the options for the standard Create HTTP route
 * of the resource.
 */
export interface StandardCreateRouteOptions extends OperationOptions {
  /**
   * kv is the Deno Kv instance to use in the HTTP handler.
   */
  kv?: Deno.Kv;
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
