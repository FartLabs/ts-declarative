import type { Handler, Route } from "@std/http/unstable-route";
import { route } from "@std/http/unstable-route";
import type { OpenAPIV3_1 } from "openapi-types";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import { jsonSchemaOf } from "#/lib/declarative/common/json-schema/json-schema.ts";

export type { Handler, Route };

/**
 * specificationOf returns the OpenAPI specification of the class.
 */
export function specificationOf<TClass extends Class>(
  target: TClass,
): OpenAPIV3_1.Document | undefined {
  return getPrototypeValue<ValueOpenAPI>(target)?.specification;
}

/**
 * routeOf compiles the routes into a single HTTP handler.
 */
export function routeOf(
  target: Class,
  defaultHandler: (
    request: Request,
    info?: Deno.ServeHandlerInfo,
  ) => Response | Promise<Response> = () =>
    new Response("Not found", { status: 404 }),
) {
  return route(routesOf(target), defaultHandler);
}

/**
 * routesOf returns the HTTP routes of the OpenAPI class.
 */
export function routesOf(target: Class): Route[] {
  return getPrototypeValue<ValueHttpRoutes>(target)?.routes ?? [];
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
) => (target: Class) => Class = createOpenAPIDecoratorFactory();

/**
 * createOpenAPIDecoratorFactory is the factory function for the OpenAPI
 * decorator.
 */
export function createOpenAPIDecoratorFactory(): (
  options?: OpenAPIDecoratorOptions | undefined,
) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: (options?: OpenAPIDecoratorOptions) => {
      return [declarativeOpenAPI(options)];
    },
  });
}

/**
 * reducePathsObject reduces the paths object of the OpenAPI
 * specification.
 */
export function reducePathsObject(
  paths: OpenAPIV3_1.PathsObject,
  pathsObject: OpenAPIV3_1.PathsObject,
): OpenAPIV3_1.PathsObject {
  for (const path in pathsObject) {
    paths[path] = { ...paths[path], ...pathsObject[path] };
  }

  return paths;
}

/**
 * OpenAPIDecoratorOptions is the options for the OpenAPI decorator.
 */
export interface OpenAPIDecoratorOptions extends ValueHttpRoutes {
  /**
   * resources are the resources of the OpenAPI specification.
   */
  resources?: Class[];

  /**
   * specification is the base OpenAPI specification.
   */
  specification?: Partial<OpenAPIV3_1.Document>;
}

/**
 * declarativeOpenAPI is the declarative function for OpenAPI specification.
 */
export function declarativeOpenAPI<TValue extends ValueOpenAPI>(
  options?: OpenAPIDecoratorOptions,
): Declarative<TValue> {
  return (value, name) => {
    return {
      ...value,
      specification: {
        ...options?.specification,
        openapi: options?.specification?.openapi ?? "3.0.1",
        info: {
          ...options?.specification?.info,
          title: options?.specification?.info?.title ?? name,
          version: options?.specification?.info?.version ?? "1.0.0",
        },
        paths: {
          ...options?.specification?.paths,
          ...(options?.resources
            ?.map((resource) => {
              const pathsObject = pathsObjectOf(resource);
              if (pathsObject === undefined) {
                throw new Error(`pathsObject is required for ${resource.name}`);
              }

              return pathsObject;
            })
            .reduce(reducePathsObject, {}) ?? {}),
        },
        components: {
          ...options?.specification?.components,
          schemas: {
            ...options?.specification?.components?.schemas,
            ...Object.fromEntries(
              options?.resources?.map((resource) => {
                const jsonSchema = jsonSchemaOf(resource);
                if (jsonSchema === undefined) {
                  throw new Error(
                    `jsonSchema is required for ${resource.name}`,
                  );
                }

                return [resource.name, jsonSchema];
              }) ?? [],
            ),
          },
        },
      },
      routes: [
        ...(options?.routes ?? []),
        ...(options?.resources
          ?.map((resource) => {
            const routes = routesOf(resource);
            if (routes === undefined) {
              return [];
            }

            return routes;
          })
          .flat() ?? []),
      ],
    } as TValue;
  };
}

/**
 * ValueOpenAPI is the value associated with an OpenAPI specification.
 */
export interface ValueOpenAPI extends ValueHttpRoutes {
  /**
   * specification is the top-level object of the OpenAPI specification.
   */
  specification?: OpenAPIV3_1.Document;
}

/**
 * ValuePathsObject is the value of the paths object of the OpenAPI
 * specification.
 */
export interface ValuePathsObject {
  /**
   * paths is the paths object of the OpenAPI specification.
   */
  paths?: OpenAPIV3_1.PathsObject;
}

/**
 * ValueHttpRoutes is the value of the routes of the OpenAPI specification.
 */
export interface ValueHttpRoutes {
  /**
   * routes are the HTTP routes of the OpenAPI specification.
   */
  routes?: Route[];
}
