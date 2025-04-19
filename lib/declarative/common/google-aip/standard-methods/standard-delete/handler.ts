import type { StandardMethodStorage } from "#/lib/declarative/common/google-aip/standard-methods/common/storage/standard-method-storage.ts";

/**
 * standardDeleteHandler is the handler for the standard Delete operation of the
 * resource.
 */
export function standardDeleteHandler(
  storage: StandardMethodStorage,
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

    await storage.delete([...prefix, decodeURIComponent(name)]);
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
}
