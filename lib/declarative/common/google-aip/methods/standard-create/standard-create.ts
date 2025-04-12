import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type {
  ValuePathsObject,
  ValueRoutes,
} from "#/lib/declarative/common/openapi/openapi.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
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
 * declarativeStandardCreate returns the standard Create operation of the resource.
 *
 * @see https://google.aip.dev/133
 */
export function declarativeStandardCreate<TValue extends ValueStandardCreate>(
  options?: StandardCreateOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const pathname = toStandardCreatePath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );

    value ??= {} as TValue;
    value["paths"] ??= {};
    value["paths"][pathname] ??= {};
    value["paths"][pathname]["post"] = {
      description: options?.description ?? `Creates ${resourceName}`,
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
      responses: {
        "200": {
          description: options?.response?.description ??
            `The created ${resourceName}`,
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
 * toStandardCreatePath returns the path of the standard Create operation of the
 * resource.
 */
export function toStandardCreatePath(
  resourceName: string,
  collectionIdentifier?: string,
  parent?: string,
): string {
  return toOperationPath(resourceName, collectionIdentifier, parent);
}

/**
 * StandardCreateOptions is the options for the standard Create operation of the
 * resource.
 */
export interface StandardCreateOptions extends OperationOptions {}

/**
 * ValueStandardCreate is the value of the standard Create operation of the resource.
 */
export interface ValueStandardCreate
  extends ValueJSONSchema, ValuePathsObject, ValueRoutes {}
