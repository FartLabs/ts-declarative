import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type {
  Operation,
  OperationOptions,
  OperationRequest,
  OperationResponse,
} from "#/lib/declarative/common/google-aip/operation.ts";
import {
  toOperationPath,
  toOperationSchema,
} from "#/lib/declarative/common/google-aip/operation.ts";

/**
 * standardCreate is the standard Create operation specification of the resource.
 */
export const standardCreate: (
  options?: StandardCreateOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: StandardCreateOptions) => {
    return [declarativeStandardCreate(options)];
  },
});

/**
 * standardCreateOf returns the standard Create operation of the resource.
 */
export function standardCreateOf<TClass extends Class>(
  target: TClass,
): Operation | undefined {
  return getPrototypeValue<ValueStandardCreate>(target)?.standardCreate;
}

/**
 * declarativeStandardCreate returns the standard Create operation of the resource.
 *
 * @see https://google.aip.dev/133
 */
export function declarativeStandardCreate<TValue extends ValueStandardCreate>(
  options?: StandardCreateOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    return Object.assign({}, value, {
      standardCreate: {
        path: toOperationPath(
          resourceName,
          options?.collectionIdentifier,
          options?.parent,
        ),
        httpMethod: "post",
        description: options?.description ?? `Creates ${resourceName}`,
        schema: {
          ...((options?.request?.strategy ?? "body") === "body"
            ? {
              requestBody: {
                required: true,
                description: options?.request?.description ??
                  `The ${resourceName} to create`,
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
          responses: {
            "200": {
              description: options?.response?.description ??
                `Created ${resourceName}`,
              content: {
                "application/json": {
                  schema: toOperationSchema(
                    resourceName,
                    value?.jsonSchema,
                    options?.response?.schema,
                  ),
                },
              },
            },
          },
        },
      },
    });
  };
}

/**
 * StandardCreateOptions is the options for the standard Create operation of the
 * resource.
 */
export interface StandardCreateOptions extends OperationOptions {
  request?: OperationRequest;
  response?: OperationResponse;
}

/**
 * ValueStandardCreate is the value of the standard Create operation of the resource.
 */
export interface ValueStandardCreate extends ValueJSONSchema {
  standardCreate?: Operation;
}
