import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

export interface ValueType {
  type?: string[];
}

export const type = createDecoratorFactory({
  initialize: (
    value: ValueType | undefined,
    ...type: Array<string | string[]>
  ): ValueType => {
    return { ...value, type: type.flat() };
  },
});
