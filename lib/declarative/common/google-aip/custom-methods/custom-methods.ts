import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type {
  Operation,
  OperationOptions,
  OperationRequest,
  OperationResponse,
} from "#/lib/declarative/common/google-aip/operation.ts";
import { toPath } from "#/lib/declarative/common/google-aip/operation.ts";

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
  return (value, name) => {
    if (options?.verb === undefined) {
      throw new Error("verb is required");
    }

    const resourceName = options?.resourceName ?? name;
    const schemaRef = `#/components/schemas/${resourceName}`;
    const path = `${toPath(name, options)}:${options?.verb}`;
    if (value?.customMethods?.some((operation) => operation.path === path)) {
      throw new Error(
        `customMethods "${path}" already exists for resource "${resourceName}"`,
      );
    }

    return Object.assign({}, value, {
      customMethods: [
        ...(value?.customMethods ?? []),
        {
          path,
          httpMethod: options?.httpMethod ?? "post",
          schema: {
            ...(options?.request?.strategy === "body"
              ? {
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: { $ref: schemaRef },
                    },
                  },
                },
              }
              : options?.request?.strategy === "query"
              ? {
                query: {
                  required: true,
                  schema: { $ref: schemaRef },
                },
              }
              : {}),
            responses: {
              "200": {
                description: options?.response?.description,
                content: {
                  "application/json": {
                    schema: options?.response?.schema ?? { $ref: schemaRef },
                  },
                },
              },
            },
          },
        },
      ],
    });
  };
}

/**
 * CustomMethodOptions is the options for the customMethods operation of the
 * resource.
 */
export interface CustomMethodOptions extends OperationOptions {
  /**
   * verb is the prefix for the custom method. Must be camelCase.
   */
  verb: string;

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
export interface ValueCustomMethods {
  customMethods?: Operation[];
}
