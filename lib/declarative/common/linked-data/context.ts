import type { Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

// deno-lint-ignore no-explicit-any
export type Context = string | Record<string, any>;

export interface StateContext {
  context?: Context;
}

export function declarativeContext<TState extends StateContext>(
  prefix?: string,
): Declarative<TState> {
  return (state) => {
    if (typeof state?.context === "string") {
      return state;
    }

    const context = { ...state?.context };
    if (prefix !== undefined) {
      context["@vocab"] = prefix;
    }

    return { ...state, context };
  };
}

export const context = createDecoratorFactory(
  {
    initialize: (context?: Context): StateContext => {
      return { context };
    },
  },
  declarativeContext(),
);
