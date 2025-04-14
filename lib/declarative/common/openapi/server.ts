import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type {
  RouterDecoratorOptions,
  ValueRouterRoutes,
} from "#/lib/declarative/common/router/router.ts";
import { declarativeRoutes } from "#/lib/declarative/common/router/router.ts";
import type {
  OpenAPISpecificationDecoratorOptions,
  ValueOpenAPISpecification,
} from "./specification.ts";
import { declarativeOpenAPISpecification } from "./specification.ts";

/**
 * openapi is the decorator for OpenAPI server.
 */
export const openapi: (
  options?: OpenAPIServerDecoratorOptions | undefined,
) => (target: Class) => Class = createOpenAPIServerDecoratorFactory();

/**
 * createOpenAPIServerDecoratorFactory is the factory function for the
 * OpenAPI server decorator.
 */
export function createOpenAPIServerDecoratorFactory(): (
  options?: OpenAPIServerDecoratorOptions | undefined,
) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: (
      options?: OpenAPIServerDecoratorOptions,
    ): Array<Declarative<ValueOpenAPIServer>> => {
      return [
        declarativeOpenAPISpecification(options),
        declarativeRoutes(options),
      ];
    },
  });
}

/**
 * OpenAPIServerDecoratorOptions is the options for the OpenAPI server
 * decorator.
 */
export interface OpenAPIServerDecoratorOptions
  extends OpenAPISpecificationDecoratorOptions, RouterDecoratorOptions {}

/**
 * ValueOpenAPIServer is the value associated with an OpenAPI server.
 */
export interface ValueOpenAPIServer
  extends ValueOpenAPISpecification, ValueRouterRoutes {}
