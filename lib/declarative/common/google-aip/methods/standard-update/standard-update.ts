import { toCamelCase } from "@std/text/to-camel-case";
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
import { standardUpdateHandler } from "./handler.ts";

/**
 * standardUpdate is the standard Update operation specification of the resource.
 *
 * @see https://google.aip.dev/134
 */
export const standardUpdate: (
  options?: StandardUpdateOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: StandardUpdateOptions) => {
    return [
      declarativeStandardUpdateSpecification(options),
      declarativeStandardUpdateRoute(options),
    ];
  },
});

/**
 * StandardUpdateOptions are the options for the standard Update operation of the
 * resource.
 */
export interface StandardUpdateOptions
  extends StandardUpdateSpecificationOptions, StandardUpdateRouteOptions {}

/**
 * ValueStandardUpdate is the value of the standard Update operation of the resource.
 */
export interface ValueStandardUpdate
  extends ValueJSONSchema, ValuePathsObject, ValueRouterRoutes {}

/**
 * declarativeStandardUpdateSpecification returns the standard Update operation of the resource.
 */
export function declarativeStandardUpdateSpecification<
  TValue extends ValueStandardUpdate,
>(
  options?: StandardUpdateSpecificationOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const pathname = toStandardUpdatePath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );

    value ??= {} as TValue;
    value["paths"] ??= {};
    value["paths"][pathname] ??= {};
    value["paths"][pathname]["post"] = {
      description: options?.description ?? `Updates ${resourceName}`,
      requestBody: {
        required: true,
        description: options?.request?.description ??
          `The ${resourceName} to update`,
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
      parameters: [{
        name: toCamelCase(resourceName),
        in: "path",
        required: true,
      }],
      responses: {
        "200": {
          description: options?.request?.description ??
            `The updated ${resourceName}`,
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
 * toStandardUpdatePath returns the path of the standard Update operation of the
 * resource.
 */
export function toStandardUpdatePath(
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
 * toStandardUpdatePattern returns the URL pattern of the standard Update operation
 * of the resource.
 */
export function toStandardUpdatePattern(
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
 * StandardUpdateSpecificationOptions is the options for the standard Update
 * operation of the resource.
 */
export interface StandardUpdateSpecificationOptions extends OperationOptions {}

/**
 * declarativeStandardUpdateRoute returns the standard Update operation of the
 * resource.
 */
export function declarativeStandardUpdateRoute<
  TValue extends ValueStandardUpdate,
>(options?: StandardUpdateRouteOptions): Declarative<TValue> {
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
      pattern: toStandardUpdatePattern(
        resourceName,
        options?.collectionIdentifier,
        options?.parent,
      ),
      method: "POST",
      handler: standardUpdateHandler(
        options.kv,
        [keyPrefix],
        toCamelCase(resourceName),
      ),
    });

    return value;
  };
}

/**
 * StandardUpdateRouteOptions is the options for the standard Update
 * operation of the resource.
 */
export interface StandardUpdateRouteOptions extends OperationOptions {
  /**
   * kv is the Deno Kv instance to use in the HTTP handler.
   */
  kv?: Deno.Kv;
}
