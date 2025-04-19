import type { StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/standard-method-store.ts";

/**
 * standardListHandler is the handler for the standard List operation of the
 * resource.
 */
export function standardListHandler(
  store: StandardMethodStore,
  _prefix: string[],
): (request: Request) => Promise<Response> {
  return async (_request) => {
    const result = await Array.fromAsync(store.list());
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
}
