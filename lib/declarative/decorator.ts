// deno-lint-ignore-file no-explicit-any

import type { Class, Declarative, DeclarativeOptions } from "./declarative.ts";
import { declareClass } from "./declarative.ts";

export interface DecoratorFactoryOptions<TValue, TArgs extends any[]>
  extends Omit<DeclarativeOptions<Class, TValue>, "target" | "initialize"> {
  // TODO: initialize: (args: TArgs, value: TValue) => TValue;
  initialize: (...args: TArgs) => TValue;
}

export function createDecoratorFactory<TValue, TArgs extends any[]>(
  options: DecoratorFactoryOptions<TValue, TArgs>,
  ...fns: Declarative<TValue>[]
): (...args: TArgs) => (target: Class) => Class {
  return function (...args: TArgs) {
    return function <TClass extends Class>(target: TClass) {
      return declareClass<TClass, TValue>(
        {
          ...options,
          target,
          initialize: () => {
            return options.initialize(...args);
          },
        },
        ...fns,
      );
    };
  };
}
