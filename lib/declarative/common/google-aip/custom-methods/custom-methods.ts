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
 * customMethod is a decorator factory that creates a custom method for the
 * resource.
 */
export const customMethod: (
  options?: CustomMethodOptions,
) => (target: Class) => Class = createDecoratorFactory({
  initialize: (options?: CustomMethodOptions) => {
    return [declarativeCustomMethods(options)];
  },
});

/**
 * customMethodsOf returns the customMethods operation of the resource.
 */
export function customMethodsOf<TClass extends Class>(
  target: TClass,
): Operation[] | undefined {
  return getPrototypeValue<ValueCustomMethods>(target)?.customMethods;
}

/**
 * declarativeCustomMethods returns the customMethods operation of the resource.
 *
 * @see https://google.aip.dev/136
 */
export function declarativeCustomMethods<TValue extends ValueCustomMethods>(
  options?: CustomMethodOptions,
): Declarative<TValue> {
  return (value, name): TValue => {
    if (options?.name === undefined) {
      throw new Error("verb is required");
    }

    const resourceName = options?.resourceName ?? name;
    const path = `${
      toOperationPath(
        resourceName,
        options.collectionIdentifier,
        options.parent,
      )
    }:${options?.name}`;
    if (value?.customMethods?.some((operation) => operation.path === path)) {
      throw new Error(
        `customMethods "${path}" already exists for resource "${resourceName}"`,
      );
    }

    return {
      ...value,
      customMethods: [
        ...(value?.customMethods ?? []),
        {
          path,
          httpMethod: options?.httpMethod ?? "post",
          description: options?.description,
          schema: {
            ...((options?.request?.strategy ?? "body") === "body"
              ? {
                description: options?.request?.description,
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: toOperationSchema(
                        resourceName,
                        value?.jsonSchema,
                        options.request?.schema,
                      ),
                    },
                  },
                },
              }
              : {}),
            responses: {
              "200": {
                description: options?.response?.description,
                content: {
                  "application/json": {
                    schema: toOperationSchema(
                      resourceName,
                      value?.jsonSchema,
                      options.response?.schema,
                    ),
                  },
                },
              },
            },
          },
        },
      ],
    } as TValue;
  };
}

/**
 * CustomMethodOptions is the options for the customMethods operation of the
 * resource.
 */
export interface CustomMethodOptions extends OperationOptions {
  /**
   * name is the prefix for the custom method. Must be a camelCase verb.
   */
  name: string;

  /**
   * httpMethod is the HTTP method for the custom method. Defaults to "post".
   */
  httpMethod?: string;

  /**
   * request is the input for the custom method.
   */
  request?: OperationRequest;

  /**
   * response is the output for the custom method.
   */
  response?: OperationResponse;
}

/**
 * ValueCustomMethods is the value of the customMethods operation of the resource.
 */
export interface ValueCustomMethods extends ValueJSONSchema {
  customMethods?: Operation[];
}
