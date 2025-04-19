/**
 * standardCreateHandler is the handler for the standard Create operation of the
 * resource.
 */
export function standardCreateHandler(
  kv: Deno.Kv,
  prefix: Deno.KvKey,
  primaryKey = "name",
  // deno-lint-ignore no-explicit-any
  validator?: (data: any) => boolean,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const body = await request.json();
    if (body?.[primaryKey] === undefined) {
      return new Response(`Primary key "${primaryKey}" not found`, {
        status: 400,
      });
    }

    if (validator !== undefined) {
      const isValid = validator(body);
      if (!isValid) {
        return new Response("Request body is not valid", {
          status: 400,
        });
      }
    }

    const result = await kv.set([...prefix, body[primaryKey]], body);
    if (!result?.ok) {
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(body), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
}
