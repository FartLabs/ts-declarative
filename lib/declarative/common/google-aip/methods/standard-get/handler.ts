/**
 * standardGetHandler is the handler for the standard Get operation of the
 * resource.
 */
export function standardGetHandler(
  kv: Deno.Kv,
  prefix: Deno.KvKey,
): (request: Request, params?: URLPatternResult | null) => Promise<Response> {
  return async (_request, params) => {
    const name = params?.pathname.groups.name;
    if (!name) {
      return new Response("Name parameter is missing", {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    const result = await kv.get([...prefix, name]);
    if (result.value === null) {
      return new Response(JSON.stringify(result), {
        status: 404,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(result.value), {
      headers: {
        "content-type": "application/json",
      },
    });
  };
}
