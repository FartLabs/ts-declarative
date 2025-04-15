import { toCamelCase } from "@std/text/to-camel-case";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type { ValuePathsObject } from "#/lib/declarative/common/openapi/paths-object.ts";
import type { ValueRouterRoutes } from "#/lib/declarative/common/router/router.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
import { toOperationPath } from "#/lib/declarative/common/google-aip/operation.ts";
import { toOperationSchema } from "#/lib/declarative/common/google-aip/mod.ts";
import { standardGetHandler } from "./handler.ts";

// TODO: Create batch method batchGet.

/**
 * standardGet is the standard Get operation specification of the resource.
 *
 * @see https://google.aip.dev/131
 */
export const standardGet: (
  options?: StandardGetOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: initializeStandardGet,
});

/**
 * initializeStandardGet returns the standard Get operation of the resource.
 */
export function initializeStandardGet(
  options?: StandardGetOptions,
): Array<Declarative<ValueStandardGet>> {
  return [
    declarativeStandardGetSpecification(options),
    declarativeStandardGetRoute(options),
  ];
}

/**
 * StandardGetOptions is the options for the standard Get operation of the
 * resource.
 */
export interface StandardGetOptions
  extends StandardGetSpecificationOptions, StandardGetRouteOptions {}

/**
 * ValueStandardGet is the value of the standard Get operation of the resource.
 */
export interface ValueStandardGet
  extends ValueJSONSchema, ValuePathsObject, ValueRouterRoutes {}

/**
 * declarativeStandardGetSpecification returns the standard Get operation of
 * the resource.
 */
export function declarativeStandardGetSpecification<
  TValue extends ValueStandardGet,
>(options?: StandardGetSpecificationOptions): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const pathname = toStandardGetPath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );

    value ??= {} as TValue;
    value["paths"] ??= {};
    value["paths"][pathname] ??= {};
    value["paths"][pathname]["get"] = {
      description: options?.description ?? `Gets ${resourceName}`,
      parameters: [
        {
          name: toCamelCase(resourceName),
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: options?.response?.description ?? `Got ${resourceName}`,
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
 * toStandardGetPath returns the path of the standard Get operation of the
 * resource.
 */
export function toStandardGetPath(
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
 * toStandardGetPattern returns the URL pattern of the standard Get operation
 * of the resource.
 */
export function toStandardGetPattern(
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
  }/:${toCamelCase(resourceName)}`;
}

/**
 * StandardGetSpecificationOptions is the options for the standard Get operation of the
 * resource.
 */
export interface StandardGetSpecificationOptions extends OperationOptions {}

/**
 * declarativeStandardGetRoute returns the standard Get operation of the
 * resource.
 */
export function declarativeStandardGetRoute<TValue extends ValueStandardGet>(
  options?: StandardGetRouteOptions,
): Declarative<TValue> {
  return (value, name) => {
    if (options?.kv === undefined) {
      throw new Error("kv is required");
    }

    const resourceName = options?.resourceName ?? name;
    const keyPrefix: Deno.KvKeyPart = toOperationPath(
      resourceName,
      options.collectionIdentifier,
      options.parent,
    );

    value ??= {} as TValue;
    value["routes"] ??= [];
    value["routes"].push({
      pattern: new URLPattern({
        pathname: toStandardGetPattern(toCamelCase(resourceName)),
      }),
      method: "GET",
      handler: standardGetHandler(
        options.kv,
        [keyPrefix],
        toCamelCase(resourceName),
      ),
    });

    return value;
  };
}

/**
 * StandardGetRouteOptions is the options for the standard Get operation of the
 * resource.
 */
export interface StandardGetRouteOptions extends OperationOptions {
  /**
   * kv is the Deno Kv instance to use in the HTTP handler.
   */
  kv?: Deno.Kv;
}
