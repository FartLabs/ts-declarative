import type { Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

// deno-lint-ignore no-explicit-any
export type Context = string | Record<string, any>;

export interface ValueContext {
  context?: Context;
}

export const context = await createDecoratorFactory({
  initialize: (context?: Context) => {
    return [declarativeContext(context)];
  },
});

export function declarativeContext<TValue extends ValueContext>(
  context?: Context,
): Declarative<TValue> {
  return <TValue extends ValueContext>(value: TValue | undefined): TValue => {
    return { ...value, context } as TValue;
  };
}
