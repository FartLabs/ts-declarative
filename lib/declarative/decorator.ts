// deno-lint-ignore-file no-explicit-any

import type { Class, Declarative, DeclarativeOptions } from "./declarative.ts";
import { declareClass } from "./declarative.ts";

export interface DecoratorFactoryOptions<TValue, TArgs extends any[]>
  extends Omit<DeclarativeOptions<Class, TValue>, "target"> {
  initialize?: (...args: TArgs) => Declarative<TValue>[];
}

export function createDecoratorFactory<TValue, TArgs extends any[]>(
  options: DecoratorFactoryOptions<TValue, TArgs>,
): (...args: TArgs) => (target: Class) => Class {
  return function (...args: TArgs) {
    const fns = options.initialize?.(...args) ?? [];
    return function <TClass extends Class>(target: TClass) {
      return declareClass<TClass, TValue>({ ...options, target }, ...fns);
    };
  };
}
