import type { Route } from "@std/http/unstable-route";
import { route } from "@std/http/unstable-route";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

export type { Route };

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
  return getPrototypeValue<ValueRoutes>(target)?.routes ?? [];
}

/**
 * httpRoutes is a decorator for HTTP routes.
 */
export const httpRoutes = createDecoratorFactory({
  initialize: (options?: RoutesDecoratorOptions) => {
    return [declarativeRoutes(options)];
  },
});

/**
 * declarativeRoutes is a declarative function for HTTP routes.
 */
export function declarativeRoutes<TValue extends ValueRoutes>(
  options?: RoutesDecoratorOptions,
): Declarative<TValue> {
  return (value) => {
    return {
      ...value,
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

export interface RoutesDecoratorOptions extends ValueRoutes {
  /**
   * resources is a list of resources.
   */
  resources?: Class[];
}

/**
 * ValueRoutes is the value for the HTTP routes.
 */
export interface ValueRoutes {
  /**
   * routes is a list of HTTP routes.
   */
  routes?: Route[];
}
