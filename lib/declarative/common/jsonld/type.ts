import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

export function typeOf<TClass extends Class>(
  target: TClass,
): string | undefined {
  return getPrototypeValue<ValueType>(target)?.type;
}

export interface ValueType {
  type?: string;
}

export const type: (...args: [string]) => (target: Class) => Class =
  createDecoratorFactory({
    initialize: (type: string) => {
      return [declarativeType(type)];
    },
  });

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
