import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

/**
 * contextOf returns the JSON-LD context of the class.
 */
export function contextOf<TClass extends Class>(
  target: TClass,
): Context | undefined {
  return getPrototypeValue<ValueContext>(target)?.context;
}

/**
 * Context is the type of the context of the class.
 */
// deno-lint-ignore no-explicit-any
export type Context = string | Record<string, any>;

/**
 * ValueContext is the interface for the context of the class.
 */
export interface ValueContext {
  /**
   * context is the JSON-LD context of the class.
   */
  context?: Context;
}

/**
 * context is a decorator that sets the context of the class.
 */
export const context: (
  context?: Context | undefined,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (context?: Context) => {
    return [declarativeContext(context)];
  },
});

/**
 * declarativeContext sets the context of the class.
 *
 * @see https://www.w3.org/TR/json-ld/#the-context
 */
export function declarativeContext<TValue extends ValueContext>(
  context?: Context,
): Declarative<TValue> {
  return <TValue extends ValueContext>(value: TValue | undefined): TValue => {
    return { ...value, context } as TValue;
  };
}
