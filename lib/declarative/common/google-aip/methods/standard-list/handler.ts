/**
 * standardListHandler is the handler for the standard List operation of the
 * resource.
 */
export function standardListHandler(
  kv: Deno.Kv,
  prefix: Deno.KvKey,
): (request: Request) => Promise<Response> {
  return async (_request) => {
    const result = await Array.fromAsync(kv.list({ prefix }));
    return new Response(
      JSON.stringify(
        result.map((entry) => {
          return entry.value;
        }),
      ),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  };
}
