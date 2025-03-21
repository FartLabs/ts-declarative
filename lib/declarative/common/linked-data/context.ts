import type { Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

// deno-lint-ignore no-explicit-any
export type Context = string | Record<string, any>;

export interface ValueContext {
  context?: Context;
}

export function declarativeContext<TValue extends ValueContext>(
  prefix?: string,
): Declarative<TValue> {
  return <TValue extends ValueContext>(value: TValue | undefined): TValue => {
    if (typeof value?.context === "string") {
      return value;
    }

    const context: Context = { ...value?.context };
    if (prefix !== undefined) {
      context["@vocab"] = prefix;
    }

    return { ...value, context } as TValue;
  };
}

export const context = createDecoratorFactory(
  {
    initialize: (
      value: ValueContext | undefined,
      context?: Context,
    ): ValueContext => {
      return { ...value, context };
    },
  },
  declarativeContext(),
);
