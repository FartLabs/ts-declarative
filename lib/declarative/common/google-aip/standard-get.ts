import { slugify } from "@std/text/unstable-slugify";
import type { OpenAPIV3_1 } from "openapi-types";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";

/**
 * standardGet is the standard Get operation specification of the resource.
 */
export const standardGet: (
  options?: StandardGetOptions
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: StandardGetOptions) => {
    return [declarativeStandardGet(options)];
  },
});

/**
 * standardGetOf returns the standard Get operation of the resource.
 */
export function standardGetOf<TClass extends Class>(
  target: TClass
): StandardGet | undefined {
  return getPrototypeValue<ValueStandardGet>(target)?.standardGet;
}

/**
 * declarativeStandardGet returns the standard Get operation of the resource.
 *
 * @see https://google.aip.dev/131
 */
export function declarativeStandardGet<TValue extends ValueStandardGet>(
  options?: StandardGetOptions
): Declarative<TValue> {
  return (value, name) => {
    return Object.assign({}, value, {
      standardGet: {
        path: `${options?.path ?? `/${slugify(name)}`}/{name}`,
        operation: {
          parameters: [{ name: "name", in: "path", required: true }],
        },
      },
    });
  };
}

/**
 * StandardGetOptions is the options for the standard Get operation of the
 * resource.
 */
export interface StandardGetOptions {
  path?: string;
}

/**
 * ValueStandardGet is the value of the standard Get operation of the resource.
 */
export interface ValueStandardGet extends ValueJSONSchema {
  standardGet?: StandardGet;
}

/**
 * StandardGet is the standard Get operation specification of the resource.
 */
export interface StandardGet {
  path: string;
  operation: OpenAPIV3_1.OperationObject;
}
