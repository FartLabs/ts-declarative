import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type {
  Operation,
  OperationOptions,
  OperationRequest,
} from "#/lib/declarative/common/google-aip/operation.ts";
import {
  toOperationPath,
  toOperationSchema,
} from "#/lib/declarative/common/google-aip/operation.ts";

/**
 * standardUpdate is the standard Update operation specification of the resource.
 */
export const standardUpdate: (
  options?: StandardUpdateOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: StandardUpdateOptions) => {
    return [declarativeStandardUpdate(options)];
  },
});

/**
 * standardUpdateOf returns the standard Update operation of the resource.
 */
export function standardUpdateOf<TClass extends Class>(
  target: TClass,
): Operation | undefined {
  return getPrototypeValue<ValueStandardUpdate>(target)?.standardUpdate;
}

/**
 * declarativeStandardUpdate returns the standard Update operation of the resource.
 *
 * @see https://google.aip.dev/134
 */
export function declarativeStandardUpdate<TValue extends ValueStandardUpdate>(
  options?: StandardUpdateOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    return Object.assign({}, value, {
      standardUpdate: {
        path: `${
          toOperationPath(
            resourceName,
            options?.collectionIdentifier,
            options?.parent,
          )
        }/{name}`,
        httpMethod: "post",
        description: options?.description ?? `Updates ${resourceName}`,
        schema: {
          ...((options?.request?.strategy ?? "body") === "body"
            ? {
              description: options?.request?.description ??
                `The ${resourceName} to update`,
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: toOperationSchema(
                      resourceName,
                      value?.jsonSchema,
                      options?.request?.schema,
                    ),
                  },
                },
              },
            }
            : {}),
          parameters: [{ name: "name", in: "path", required: true }],
        },
      },
    });
  };
}

/**
 * StandardUpdateOptions is the options for the standard Update operation of the
 * resource.
 */
export interface StandardUpdateOptions extends OperationOptions {
  request?: OperationRequest;
}

/**
 * ValueStandardUpdate is the value of the standard Update operation of the resource.
 */
export interface ValueStandardUpdate extends ValueJSONSchema {
  standardUpdate?: Operation;
}
