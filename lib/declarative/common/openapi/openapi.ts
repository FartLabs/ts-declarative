import type { Route } from "@std/http/unstable-route";
import type { OpenAPIV3_1 } from "openapi-types";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

/**
 * specificationOf returns the OpenAPI specification of the class.
 */
export function specificationOf<TClass extends Class>(
  target: TClass,
): OpenAPIV3_1.Document | undefined {
  return getPrototypeValue<ValueOpenAPI>(target)?.specification;
}

/**
 * routesOf returns the HTTP routes of the OpenAPI class.
 */
export function routesOf<TClass extends Class>(
  target: TClass,
): Route[] | undefined {
  return getPrototypeValue<ValueOpenAPI>(target)?.routes;
}

/**
 * pathsObjectOf returns the paths object of the OpenAPI class.
 */
export function pathsObjectOf<TClass extends Class>(
  target: TClass,
): OpenAPIV3_1.PathsObject | undefined {
  return getPrototypeValue<ValuePathsObject>(target)?.paths;
}

/**
 * openapi is the decorator for OpenAPI specification.
 */
export const openapi: (
  options?: OpenAPIDecoratorOptions,
) => (target: Class) => Class = openapiDecoratorFactory();

/**
 * openapiDecoratorFactory is the factory function for the OpenAPI decorator.
 */
export function openapiDecoratorFactory() {
  return createDecoratorFactory({
    initialize: (options?: OpenAPIDecoratorOptions) => {
      if (options?.specification === undefined) {
        throw new Error("base specification is required");
      }

      return [
        declarativeOpenAPI({
          specification: {
            ...options.specification,
            paths: {
              ...options.specification?.paths,
              ...(options.resources?.reduce(
                (paths, resource) => ({
                  ...paths,
                  ...pathsObjectOf(resource),
                }),
                {},
              ) ?? []),
            },
          },
        }),
      ];
    },
  });
}

/**
 * OpenAPIDecoratorOptions is the options for the OpenAPI decorator.
 */
export interface OpenAPIDecoratorOptions extends ValueOpenAPI {
  /**
   * resources are the resources of the OpenAPI specification.
   */
  resources?: Class[];
}

/**
 * declarativeOpenAPI is the declarative function for OpenAPI specification.
 */
export function declarativeOpenAPI<TValue extends ValueOpenAPI>(
  value0?: TValue,
): Declarative<TValue> {
  return (value1) => {
    return { ...value0, ...value1 } as TValue;
  };
}

/**
 * ValueOpenAPI is the value associated with an OpenAPI specification.
 */
export interface ValueOpenAPI {
  /**
   * specification is the top-level object of the OpenAPI specification.
   */
  specification?: OpenAPIV3_1.Document;

  /**
   * routes are the HTTP routes of the OpenAPI specification.
   */
  routes?: Route[];
}

/**
 * ValuePathsObject is the value of the paths object of the OpenAPI
 * specification.
 */
export interface ValuePathsObject {
  paths?: OpenAPIV3_1.PathsObject;
}
