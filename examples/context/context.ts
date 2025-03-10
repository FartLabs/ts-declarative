// deno-lint-ignore-file no-explicit-any

import type { Declarative } from "#/lib/declarative/declarative.ts";

export type Context = Record<string, any>;

export interface StateContext {
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
        // TODO: Derive context from properties.
        ...state.context,
      },
    };
  };
}
