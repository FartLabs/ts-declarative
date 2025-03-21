// deno-lint-ignore-file no-explicit-any

import type { Class, Declarative, DeclarativeOptions } from "./declarative.ts";
import { declareClass } from "./declarative.ts";

export interface DecoratorFactoryOptions<TValue, TArgs extends any[]>
  extends Omit<DeclarativeOptions<Class, TValue>, "target"> {
  initialize?: (
    value: TValue | undefined,
    ...args: TArgs
  ) => TValue | undefined;
}

export function createDecoratorFactory<TValue, TArgs extends any[]>(
  options: DecoratorFactoryOptions<TValue, TArgs>,
  ...fns: Declarative<TValue>[]
): (...args: TArgs) => (target: Class) => Class {
  return function (...args: TArgs) {
    if (options.initialize !== undefined) {
      fns.unshift((value: TValue | undefined) => {
        return options.initialize!(value, ...args);
      });
    }

    return function <TClass extends Class>(target: TClass) {
      return declareClass<TClass, TValue>({ ...options, target }, ...fns);
    };
  };
}
