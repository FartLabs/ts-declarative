import { toCamelCase } from "@std/text/to-camel-case";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type {
  ValueHttpRoutes,
  ValuePathsObject,
} from "#/lib/declarative/common/openapi/openapi.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
import {
  toOperationPath,
  toOperationSchema,
} from "#/lib/declarative/common/google-aip/operation.ts";
import { standardUpdateHandler } from "./handler.ts";

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
 * declarativeStandardUpdate returns the standard Update operation of the resource.
 *
 * @see https://google.aip.dev/134
 */
export function declarativeStandardUpdate<TValue extends ValueStandardUpdate>(
  options?: StandardUpdateOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const pathname = toStandardUpdatePath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );

    value ??= {} as TValue;
    value["paths"] ??= {};
    value["paths"][pathname] ??= {};
    value["paths"][pathname]["post"] = {
      description: options?.description ?? `Updates ${resourceName}`,
      requestBody: {
        required: true,
        description: options?.request?.description ??
          `The ${resourceName} to update`,
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
      parameters: [{ name: "name", in: "path", required: true }],
      responses: {
        "200": {
          description: options?.request?.description ??
            `The updated ${resourceName}`,
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

    if (options?.kv) {
      value["routes"] ??= [];
      value["routes"].push({
        pattern: new URLPattern({
          pathname: toStandardUpdatePattern(resourceName),
        }),
        method: "POST",
        handler: standardUpdateHandler(
          options.kv,
          [
            toOperationPath(
              resourceName,
              options?.collectionIdentifier,
              options?.parent,
            ),
          ],
          toCamelCase(resourceName),
        ),
      });
    }

    return value;
  };
}

/**
 * toStandardUpdatePath returns the path of the standard Update operation of the
 * resource.
 */
export function toStandardUpdatePath(
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
  }/{${toCamelCase(resourceName)}}`;
}

/**
 * toStandardUpdatePattern returns the URL pattern of the standard Update operation
 * of the resource.
 */
export function toStandardUpdatePattern(
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
  }/:${toCamelCase(resourceName)}`;
}

/**
 * StandardUpdateOptions is the options for the standard Update operation of the
 * resource.
 */
export interface StandardUpdateOptions extends OperationOptions {
  /**
   * kv is the Deno Kv instance to use in the HTTP handler.
   */
  kv?: Deno.Kv;
}

/**
 * ValueStandardUpdate is the value of the standard Update operation of the resource.
 */
export interface ValueStandardUpdate
  extends ValueJSONSchema, ValuePathsObject, ValueHttpRoutes {}
