import { slugify } from "@std/text/unstable-slugify";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { StandardOperation } from "./standard-operation.ts";

/**
 * standardDelete is the standard Delete operation specification of the resource.
 */
export const standardDelete: (
  options?: StandardDeleteOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: StandardDeleteOptions) => {
    return [declarativeStandardDelete(options)];
  },
});

/**
 * standardDeleteOf returns the standard Delete operation of the resource.
 */
export function standardDeleteOf<TClass extends Class>(
  target: TClass,
): StandardOperation | undefined {
  return getPrototypeValue<ValueStandardDelete>(target)?.standardDelete;
}

/**
 * declarativeStandardDelete returns the standard Delete operation of the resource.
 *
 * @see https://google.aip.dev/133
 */
export function declarativeStandardDelete<TValue extends ValueStandardDelete>(
  options?: StandardDeleteOptions,
): Declarative<TValue> {
  return (value, name) => {
    return Object.assign({}, value, {
      standardDelete: {
        path: `${options?.path ?? `/${slugify(name)}`}/{name}`,
        method: "delete",
        value: {
          parameters: [{ name: "name", in: "path", required: true }],
        },
      },
    });
  };
}

/**
 * StandardDeleteOptions is the options for the standard Delete operation of the
 * resource.
 */
export interface StandardDeleteOptions {
  path?: string;
}

/**
 * ValueStandardDelete is the value of the standard Delete operation of the resource.
 */
export interface ValueStandardDelete {
  standardDelete?: StandardOperation;
}
