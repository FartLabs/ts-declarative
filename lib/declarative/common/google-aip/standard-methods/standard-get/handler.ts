import type { StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/standard-method-store.ts";

/**
 * standardGetHandler is the handler for the standard Get operation of the
 * resource.
 */
export function standardGetHandler(
  store: StandardMethodStore,
  prefix: string[],
  parameter: string,
): (request: Request, params?: URLPatternResult | null) => Promise<Response> {
  return async (_request, params) => {
    const name = params?.pathname.groups[parameter];
    if (!name) {
      return new Response("Parameter is missing", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const value = await store.get([...prefix, decodeURIComponent(name)]);
    if (value === null) {
      return new Response("{}", {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(value), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
}
