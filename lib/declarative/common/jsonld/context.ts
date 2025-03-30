import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

export function contextOf<TClass extends Class>(
  target: TClass,
): Context | undefined {
  return getPrototypeValue<ValueContext>(target)?.context;
}

// deno-lint-ignore no-explicit-any
export type Context = string | Record<string, any>;

// TODO: Replace context with prefix.
export interface ValueContext {
  // TODO: Consider replacing context with prefixes.
  context?: Context;
}

export const context: (
  context?: Context | undefined,
) => (target: Class) => Class = createDecoratorFactory({
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
