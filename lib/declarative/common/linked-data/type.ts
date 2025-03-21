import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

export interface StateType {
  type?: string[];
}

export const type = createDecoratorFactory({
  initialize: (...type: Array<string | string[]>): StateType => {
    return { type: type.flat() };
  },
});
