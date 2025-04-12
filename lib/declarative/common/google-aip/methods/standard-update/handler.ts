/**
 * standardUpdateHandler is the handler for the standard Update operation of the
 * resource.
 */
export function standardUpdateHandler(
  kv: Deno.Kv,
  prefix: Deno.KvKey,
): (request: Request, params?: URLPatternResult | null) => Promise<Response> {
  return async (request, params) => {
    const name = params?.pathname.groups.name;
    if (!name) {
      return new Response("Name parameter is missing", {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    const body = await request.json();
    const result = await kv.set([...prefix, name], body);
    if (!result?.ok) {
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(body), {
      headers: {
        "content-type": "application/json",
      },
    });
  };
}
