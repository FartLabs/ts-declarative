/**
 * standardUpdateHandler is the handler for the standard Update operation of the
 * resource.
 */
export function standardUpdateHandler(
  kv: Deno.Kv,
  prefix: string[],
  parameter: string,
  primaryKey = "name",
  // deno-lint-ignore no-explicit-any
  validator?: (data: any) => boolean,
): (request: Request, params?: URLPatternResult | null) => Promise<Response> {
  return async (request, params) => {
    const name = params?.pathname.groups[parameter];
    if (!name) {
      return new Response("Name parameter is missing", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const decodedName = decodeURIComponent(name);
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

    const op = kv.atomic().set([...prefix, body.name], body);
    if (decodedName !== body.name) {
      op.delete([...prefix, decodedName]);
    }

    const result = await op.commit();
    if (!result.ok) {
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
