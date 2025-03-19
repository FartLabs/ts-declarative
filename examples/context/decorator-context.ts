import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { Context, StateContext } from "./context.ts";
import { declarativeContext } from "./context.ts";

export const context = createDecoratorFactory(
  {
    initialize: (context?: Context): StateContext => ({
      context,
    }),
  },
  declarativeContext(),
);
