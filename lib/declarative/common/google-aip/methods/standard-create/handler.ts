/**
 * standardCreateHandler is the handler for the standard Create operation of the
 * resource.
 */
export function standardCreateHandler(
  kv: Deno.Kv,
  prefix: Deno.KvKey,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const body = await request.json();
    const result = await kv.set([...prefix, body?.name], body);
    if (!result?.ok) {
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    // TODO: Delete console log.
    // console.log({
    //   result,
    //   body,
    //   key: [...prefix, body?.name],
    // });

    return new Response(JSON.stringify(body), {
      headers: {
        "content-type": "application/json",
      },
    });
  };
}
