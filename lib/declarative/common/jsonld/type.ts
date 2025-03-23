import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

export interface ValueType {
  type?: string[];
}

export const type: (
  ...args: Array<string | string[]>
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (...type: Array<string | string[]>) => {
    return [declarativeType(...type)];
  },
});

export function declarativeType<TValue extends ValueType>(
  ...type: Array<string | string[]>
): Declarative<TValue> {
  return <TValue extends ValueType>(value: TValue | undefined): TValue => {
    return { ...value, type: type.flat() } as TValue;
  };
}
