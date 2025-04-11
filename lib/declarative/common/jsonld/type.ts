import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

/**
 * typeOf returns the type associated with the class.
 */
export function typeOf<TClass extends Class>(
  target: TClass,
): string | undefined {
  return getPrototypeValue<ValueType>(target)?.type;
}

/**
 * ValueType is the value for the type decorator.
 */
export interface ValueType {
  /**
   * type is the type of the value.
   */
  type?: string;
}

/**
 * type is the decorator for the type of the class.
 * This is used to set the type of the class.
 */
export const type: (...args: [string]) => (target: Class) => Class =
  createDecoratorFactory({
    initialize: (type: string) => {
      return [declarativeType(type)];
    },
  });

/**
 * declarativeType is a function that returns a declarative function that
 * sets the type of the value.
 */
export function declarativeType<TValue extends ValueType>(
  type?: string,
): Declarative<TValue> {
  return <TValue extends ValueType>(
    value: TValue | undefined,
    name: string,
  ): TValue => {
    return { ...value, type: type ?? name } as TValue;
  };
}
