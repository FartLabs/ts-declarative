import type { OpenAPIV3_1 } from "openapi-types";
import type { Handler } from "@std/http/unstable-route";
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

export type { Handler };

/**
 * customMethod is a decorator factory that creates a custom method for the
 * resource.
 *
 * @see https://google.aip.dev/136
 */
export const customMethod: (
  options?: CustomMethodOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: CustomMethodOptions) => {
    return [
      declarativeCustomMethodSpecification(options),
      declarativeCustomMethodRoute(options),
    ];
  },
});

// TODO: Represent batch methods in terms of custom methods.

/**
 * declarativeCustomMethodSpecification is a decorator factory that creates a
 * custom method OpenAPI specification for the resource.
 */
export function declarativeCustomMethodSpecification<
  TValue extends ValueCustomMethods,
>(options?: CustomMethodOptions): Declarative<TValue> {
  return (value, name) => {
    if (options?.name === undefined) {
      throw new Error("Custom method name is required");
    }

    const resourceName = options?.resourceName ?? name;
    const pathname = toCustomMethodPath(resourceName, options);
    const httpMethod: OpenAPIV3_1.HttpMethods = (options?.httpMethod ??
      "post") as OpenAPIV3_1.HttpMethods;

    return mergeValue(value, {
      paths: {
        [pathname]: {
          [httpMethod]: {
            description: options?.description ?? `Custom ${options?.name}`,
            requestBody: {
              required: true,
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
                  `The ${resourceName}`,
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
 * declarativeCustomMethodRoute is a decorator factory that creates a custom
 * method for the resource.
 */
export function declarativeCustomMethodRoute<TValue extends ValueCustomMethods>(
  options?: CustomMethodOptions,
): Declarative<TValue> {
  return (value, name) => {
    if (options?.name === undefined) {
      throw new Error("Custom method name is required");
    }

    const resourceName = options?.resourceName ?? name;
    if (options?.handler === undefined) {
      throw new Error("Custom method handler is required");
    }

    return mergeValue(value, {
      routes: [
        {
          pattern: toCustomMethodPattern(resourceName, options),
          method: options?.httpMethod ?? "post",
          handler: options.handler,
        },
      ],
    });
  };
}

/**
 * toCustomMethodPath is a helper function that returns the path for a custom
 * method.
 */
export function toCustomMethodPath(
  resourceName: string,
  options?: CustomMethodOptions,
): string {
  return `${
    toOperationPath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    )
  }:${options?.name}`;
}

/**
 * toCustomMethodPattern is a helper function that returns the pattern for a custom
 * method.
 */
export function toCustomMethodPattern(
  resourceName: string,
  options?: CustomMethodOptions,
): URLPattern {
  return new URLPattern({
    pathname: toCustomMethodPath(resourceName, options),
  });
}

/**
 * CustomMethodOptions is the options for the customMethod operation of the
 * resource.
 */
export interface CustomMethodOptions extends OperationOptions {
  /**
   * name is the name of the custom method. Must be a camelCase verb.
   */
  name: string;

  /**
   * httpMethod is the HTTP method for the custom method. Defaults to "post".
   */
  httpMethod?: string;

  /**
   * handler is the handler for the custom method.
   */
  handler?: Handler;
}

/**
 * ValueCustomMethods is the value of the customMethod operation of the resource.
 */
export interface ValueCustomMethods
  extends ValueJSONSchema, ValuePathsObject, ValueRouterRoutes {}
