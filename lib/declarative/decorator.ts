// deno-lint-ignore-file no-explicit-any

import type { DeclarativeStorage } from "./storage/storage.ts";
import type { Class, Declarative } from "./declarative.ts";
import { declareClass } from "./declarative.ts";

export interface DecoratorFactoryOptions<
  TValue extends Record<string, any>,
  TArgs extends any[],
> {
  storage: DeclarativeStorage<TValue>;
  prefix: string;
  initialize: (...args: TArgs) => TValue;
}

export function createDecoratorFactory<
  TValue extends Record<string, any>,
  TArgs extends any[],
>(
  options: DecoratorFactoryOptions<TValue, TArgs>,
  ...fns: Declarative<TValue>[]
) {
  return function (...args: TArgs) {
    return function <TClass extends Class>(target: TClass) {
      return declareClass<TClass, TValue>(
        {
          storage: options.storage,
          prefix: options.prefix,
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
