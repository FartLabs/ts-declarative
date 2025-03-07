// deno-lint-ignore-file no-explicit-any

import type { Class, Declarative, DeclarativeOptions } from "./declarative.ts";
import { declareClass } from "./declarative.ts";

export interface DecoratorFactoryOptions<
  TArgs extends any[],
  TValue extends Record<string, any>,
> extends DeclarativeOptions<TValue> {
  initialize: (...args: TArgs) => TValue;
}

export function createDecoratorFactory<
  TArgs extends any[],
  TValue extends Record<string, any>,
>(
  options: DecoratorFactoryOptions<TArgs, TValue>,
  ...fns: Declarative<TValue>[]
) {
  return function (...args: TArgs) {
    return function <TClass extends Class>(target: TClass) {
      return declareClass<TClass, TValue>(
        options,
        target,
        () => {
          return options.initialize(...args);
        },
        ...fns,
      );
    };
  };
}
