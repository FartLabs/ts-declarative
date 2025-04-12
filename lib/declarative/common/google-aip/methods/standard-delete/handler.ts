/**
 * standardDeleteHandler is the handler for the standard Delete operation of the
 * resource.
 */
export function standardDeleteHandler(
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

    await kv.delete([...prefix, name]);
    return new Response("Resource deleted successfully", {
      headers: {
        "content-type": "application/json",
      },
    });
  };
}
