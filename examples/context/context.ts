// deno-lint-ignore-file no-explicit-any

import type { Declarative } from "#/declarative/declarative.ts";

export type Context = Record<string, any>;

export function declarativeContext<TState extends { context?: Context }>(
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
