/**
 * standardGetHandler is the handler for the standard Get operation of the
 * resource.
 */
export function standardGetHandler(
  kv: Deno.Kv,
  prefix: Deno.KvKey,
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

    const result = await kv.get([...prefix, decodeURIComponent(name)]);
    if (result.value === null) {
      return new Response(JSON.stringify(result), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(result.value), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
}
