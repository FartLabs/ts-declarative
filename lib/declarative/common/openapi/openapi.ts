import type { Route } from "@std/http/unstable-route";
import type { OpenAPIV3_1 } from "openapi-types";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueTsMorph } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";

/**
 * specificationOf returns the OpenAPI specification of the class.
 */
export function specificationOf<TClass extends Class>(
  target: TClass
): OpenAPIV3_1.Document | undefined {
  return getPrototypeValue<ValueOpenAPI>(target)?.specification;
}

/**
 * routesOf returns the HTTP routes of the OpenAPI class.
 */
export function routesOf<TClass extends Class>(
  target: TClass
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
  value0?: TValue
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
  resources?: ValueResource[];
}

/**
 * ValueResource is one resource of an OpenAPI specification.
 */
export interface ValueResource extends ValueTsMorph, ValueJSONSchema {
  /**
   * resource is the resource in the OpenAPI specification.
   */
  resource?: string;

  /**
   * path is the path of the resource in the OpenAPI specification.
   */
  path?: string;

  /**
   * operations is the operations of the resource in the OpenAPI specification.
   */
  operations?: ValueOperation[];
}

/**
 * ValueOperation is one operation of an OpenAPI specification.
 */
export interface ValueOperation extends ValueTsMorph, ValueJSONSchema {
  /**
   * operation is the operation in the OpenAPI specification.
   */
  operation?: OpenAPIV3_1.OperationObject;

  /**
   * method is the method of the operation in the OpenAPI specification.
   */
  method: string;

  /**
   * path is the path of the operation in the OpenAPI specification.
   */
  path: string;
}
