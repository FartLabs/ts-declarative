import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type { ValuePathsObject } from "#/lib/declarative/common/openapi/openapi.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
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
 * declarativeStandardDelete returns the standard Delete operation of the resource.
 *
 * @see https://google.aip.dev/135
 */
export function declarativeStandardDelete<TValue extends ValueStandardDelete>(
  options?: StandardDeleteOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const operationPath = toStandardDeletePath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );

    value ??= {} as TValue;
    value["paths"] ??= {};
    value["paths"][operationPath] ??= {};
    value["paths"][operationPath]["delete"] = {
      description: options?.description ?? `Deletes ${resourceName}`,
      parameters: [{ name: "name", in: "path", required: true }],
      responses: {
        "200": {
          description: options?.response?.description ??
            `The deleted ${resourceName}`,
        },
      },
    };

    return value;
  };
}

/**
 * toStandardDeletePath returns the path of the standard Delete operation of the
 * resource.
 */
export function toStandardDeletePath(
  resourceName: string,
  collectionIdentifier?: string,
  parent?: string,
): string {
  return `${
    toOperationPath(
      resourceName,
      collectionIdentifier,
      parent,
    )
  }/{name}`;
}

/**
 * StandardDeleteOptions is the options for the standard Delete operation of the
 * resource.
 */
export interface StandardDeleteOptions extends OperationOptions {}

/**
 * ValueStandardDelete is the value of the standard Delete operation of the resource.
 */
export interface ValueStandardDelete
  extends ValueJSONSchema, ValuePathsObject {}
