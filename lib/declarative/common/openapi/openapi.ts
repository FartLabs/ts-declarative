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

export function openapiDecoratorFactory(): () => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: (value?: ValueOpenAPI) => {
      return [declarativeOpenAPI(value)];
    },
  });
}

export function declarativeOpenAPI<TValue extends ValueOpenAPI>(
  value0?: TValue,
): Declarative<TValue> {
  return (value1) => {
    return Object.assign({}, value0, value1);
  };
}

/**
 * ValueOpenAPI is the value associated with an OpenAPI specification.
 */
export interface ValueOpenAPI {
  /**
   * specification is the OpenAPI specification.
   */
  specification?: OpenAPIV3_1.Document;

  /**
   * routes are the HTTP routes of the OpenAPI specification.
   */
  routes?: Route[];

  /**
   * resources are the resources registered in the OpenAPI specification.
   */
  resources?: Class[];
}

/**
 * Operation is an operation of an OpenAPI specification.
 */
export interface Operation {
  /**
   * path is the path of the operation.
   */
  path: string;

  /**
   * httpMethod is the HTTP method of the operation.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
   */
  httpMethod: string;

  /**
   * specification is the OpenAPI specification of the operation.
   */
  specification: OpenAPIV3_1.OperationObject;
}
