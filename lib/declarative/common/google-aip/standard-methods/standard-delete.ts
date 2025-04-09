import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type {
  Operation,
  OperationOptions,
} from "#/lib/declarative/common/google-aip/operation.ts";
import { toOperationPath } from "#/lib/declarative/common/google-aip/operation.ts";

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
): Operation | undefined {
  return getPrototypeValue<ValueStandardDelete>(target)?.standardDelete;
}

/**
 * declarativeStandardDelete returns the standard Delete operation of the resource.
 *
 * @see https://google.aip.dev/135
 */
export function declarativeStandardDelete<TValue extends ValueStandardDelete>(
  options?: StandardDeleteOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    return Object.assign({}, value, {
      standardDelete: {
        path: `${
          toOperationPath(
            resourceName,
            options?.collectionIdentifier,
            options?.parent,
          )
        }/{name}`,
        httpMethod: "delete",
        description: options?.description ??
          `Deletes ${resourceName}`,
        schema: {
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
export interface StandardDeleteOptions extends OperationOptions {}

/**
 * ValueStandardDelete is the value of the standard Delete operation of the resource.
 */
export interface ValueStandardDelete {
  standardDelete?: Operation;
}
