// deno-lint-ignore-file no-explicit-any

import type { Declarative } from "#/lib/declarative/declarative.ts";
import type { StateDenoDoc } from "#/examples/deno-doc/deno-doc.ts";

export type Context = Record<string, any>;

export interface StateContext extends StateDenoDoc {
  context?: Context;
}

export function declarativeContext<TState extends StateContext>(
  prefix: string,
): Declarative<TState> {
  return (state, _id, _name) => {
    return {
      ...state,
      context: {
        "@vocab": prefix,
        // TODO: Derive context from DenoDoc properties.
        ...state.context,
      },
    };
  };
}
