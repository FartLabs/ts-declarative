/**
 * standardDeleteHandler is the handler for the standard Delete operation of the
 * resource.
 */
export function standardDeleteHandler(
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

    await kv.delete([...prefix, decodeURIComponent(name)]);
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
}
