import { toCamelCase } from "@std/text/to-camel-case";
import type { OpenAPIV3_1 } from "openapi-types";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type {
  ValueHttpRoutes,
  ValuePathsObject,
} from "#/lib/declarative/common/openapi/openapi.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
import { toOperationPath } from "#/lib/declarative/common/google-aip/operation.ts";
import { toOperationSchema } from "#/lib/declarative/common/google-aip/mod.ts";
import { standardGetHandler } from "./handler.ts";

// TODO: Create batch method batchGet.

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
 * declarativeStandardGet returns the standard Get operation of the resource.
 *
 * @see https://google.aip.dev/131
 */
export function declarativeStandardGet<TValue extends ValueStandardGet>(
  options?: StandardGetOptions,
): Declarative<TValue> {
  return (value, name) => {
    const resourceName = options?.resourceName ?? name;
    const pathname = toStandardGetPath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );
    value ??= {} as TValue;
    value!.paths ??= {} as OpenAPIV3_1.PathsObject;
    value!.paths[pathname] ??= {
      get: {
        description: options?.description ?? `Gets ${resourceName}`,
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: options?.response?.description ??
              `Got ${resourceName}`,
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
    };

    if (options?.kv !== undefined) {
      const keyPrefix: Deno.KvKeyPart = toOperationPath(
        resourceName,
        options.collectionIdentifier,
        options.parent,
      );
      value["routes"] ??= [];
      value["routes"].push({
        pattern: new URLPattern({
          pathname: toStandardGetPattern(toCamelCase(resourceName)),
        }),
        method: "GET",
        handler: standardGetHandler(
          options.kv,
          [keyPrefix],
          toCamelCase(resourceName),
        ),
      });
    }

    return value;
  };
}

/**
 * toStandardGetPath returns the path of the standard Get operation of the
 * resource.
 */
export function toStandardGetPath(
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
 * toStandardGetPattern returns the URL pattern of the standard Get operation
 * of the resource.
 */
export function toStandardGetPattern(
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
 * StandardGetOptions is the options for the standard Get operation of the
 * resource.
 */
export interface StandardGetOptions extends OperationOptions {
  /**
   * kv is the Deno Kv instance to use in the HTTP handler.
   */
  kv?: Deno.Kv;
}

/**
 * ValueStandardGet is the value of the standard Get operation of the resource.
 */
export interface ValueStandardGet
  extends ValueJSONSchema, ValuePathsObject, ValueHttpRoutes {}
