import type { OpenAPIV3_1 } from "openapi-types";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type { ValuePathsObject } from "#/lib/declarative/common/openapi/openapi.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
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
    return [declarativeCustomMethod(options)];
  },
});

/**
 * declarativeCustomMethod returns the customMethod operation of the resource.
 *
 * @see https://google.aip.dev/136
 */
export function declarativeCustomMethod<TValue extends ValueCustomMethods>(
  options?: CustomMethodOptions,
): Declarative<TValue> {
  return (value, name): TValue => {
    if (options?.name === undefined) {
      throw new Error("Custom method name is required");
    }

    const resourceName = options?.resourceName ?? name;
    const pathname = toCustomMethodPath(resourceName, options);

    value ??= {} as TValue;
    value["paths"] ??= {};
    value["paths"][pathname] ??= {};
    value["paths"][pathname][
      (options?.httpMethod as OpenAPIV3_1.HttpMethods) ?? "post"
    ] = {
      description: options?.description ?? `Custom ${options?.name}`,
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
      responses: {
        "200": {
          description: options?.response?.description ?? `The ${resourceName}`,
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
    };

    return value;
  };
}

/**
 * toCustomMethodPath is a helper function that returns the path for a custom
 * method.
 */
export function toCustomMethodPath(
  resourceName: string,
  options?: CustomMethodOptions,
): string {
  return `${
    toOperationPath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    )
  }:${options?.name}`;
}

/**
 * CustomMethodOptions is the options for the customMethod operation of the
 * resource.
 */
export interface CustomMethodOptions extends OperationOptions {
  /**
   * name is the name of the custom method. Must be a camelCase verb.
   */
  name: string;

  /**
   * httpMethod is the HTTP method for the custom method. Defaults to "post".
   */
  httpMethod?: string;
}

/**
 * ValueCustomMethods is the value of the customMethod operation of the resource.
 */
export interface ValueCustomMethods extends ValueJSONSchema, ValuePathsObject {}
