// deno-lint-ignore-file no-explicit-any

import type { Class, Declarative, DeclarativeOptions } from "./declarative.ts";
import { declareClass } from "./declarative.ts";

/**
 * declarative is a decorator factory that applies declaratives to a class.
 */
export function declarative(
  ...declaratives: Array<Declarative<any> | Declarative<any>[]>
): (target: Class) => Class {
  return createDecoratorFactory({ initialize: () => declaratives.flat() })();
}

/**
 * DecoratorFactoryOptions is the options for the decorator factory.
 */
export interface DecoratorFactoryOptions<TValue, TArgs extends any[]>
  extends Omit<DeclarativeOptions<Class, TValue>, "target"> {
  /**
   * initialize is a function that returns an array of declarative functions.
   * The arguments are referenced on initialization of the decorator.
   */
  initialize?: (...args: TArgs) => Declarative<TValue>[];
}

/**
 * createDecoratorFactory creates a decorator factory that returns a decorator
 * function.
 */
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
