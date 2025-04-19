import type { StandardMethodStorage } from "#/lib/declarative/common/google-aip/standard-methods/common/storage/standard-method-storage.ts";

/**
 * standardCreateHandler is the handler for the standard Create operation of the
 * resource.
 */
export function standardCreateHandler(
  storage: StandardMethodStorage,
  prefix: string[],
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

    await storage.set([...prefix, body[primaryKey]], body);
    return new Response(JSON.stringify(body), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
}
