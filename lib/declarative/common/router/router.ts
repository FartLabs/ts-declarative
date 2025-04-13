import type { Route } from "@std/http/unstable-route";
import { route } from "@std/http/unstable-route";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

export type { Route };

/**
 * routerOf compiles the routes into a single callable function.
 */
export function routerOf(
  target: Class,
  defaultHandler: (
    request: Request,
    info?: Deno.ServeHandlerInfo,
  ) => Response | Promise<Response> = () =>
    new Response("Not found", { status: 404 }),
): (
  request: Request,
  info?: Deno.ServeHandlerInfo,
) => Response | Promise<Response> {
  return route(routesOf(target), defaultHandler);
}

/**
 * routesOf returns the HTTP routes of the class.
 */
export function routesOf(target: Class): Route[] {
  return getPrototypeValue<ValueRouterRoutes>(target)?.routes ?? [];
}

/**
 * routerRoutes is a decorator for HTTP routes.
 */
export const routerRoutes: (
  options?: RouterDecoratorOptions | undefined,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: RouterDecoratorOptions) => {
    return [declarativeRoutes(options)];
  },
});

/**
 * declarativeRoutes is a declarative function for HTTP routes.
 */
export function declarativeRoutes<TValue extends ValueRouterRoutes>(
  options?: RouterDecoratorOptions,
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

/**
 * RouterDecoratorOptions is the options for the router decorator.
 */
export interface RouterDecoratorOptions extends ValueRouterRoutes {
  /**
   * resources is a list of resources.
   */
  resources?: Class[];
}

/**
 * ValueRouterRoutes is the value for the HTTP routes.
 */
export interface ValueRouterRoutes {
  /**
   * routes is a list of HTTP routes.
   */
  routes?: Route[];
}
