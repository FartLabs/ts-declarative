import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type {
  Operation,
  OperationOptions,
} from "#/lib/declarative/common/google-aip/operation.ts";
import { toOperationPath } from "#/lib/declarative/common/google-aip/operation.ts";

/**
 * standardGet is the standard Get operation specification of the resource.
 */
export const standardGet: (
  options?: StandardGetOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: StandardGetOptions) => {
    return [declarativeStandardGet(options)];
  },
});

/**
 * standardGetOf returns the standard Get operation of the resource.
 */
export function standardGetOf<TClass extends Class>(
  target: TClass,
): Operation | undefined {
  return getPrototypeValue<ValueStandardGet>(target)?.standardGet;
}

/**
 * declarativeStandardGet returns the standard Get operation of the resource.
 *
 * @see https://google.aip.dev/131
 */
export function declarativeStandardGet<TValue extends ValueStandardGet>(
  options?: StandardGetOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    return Object.assign({}, value, {
      standardGet: {
        path: `${
          toOperationPath(
            resourceName,
            options?.collectionIdentifier,
            options?.parent,
          )
        }/{name}`,
        httpMethod: "get",
        description: options?.description ?? `Gets ${name}`,
        schema: {
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
export interface StandardGetOptions extends OperationOptions {}

/**
 * ValueStandardGet is the value of the standard Get operation of the resource.
 */
export interface ValueStandardGet extends ValueJSONSchema {
  standardGet?: Operation;
}
