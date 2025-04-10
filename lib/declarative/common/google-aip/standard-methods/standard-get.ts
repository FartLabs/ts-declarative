import type { OpenAPIV3_1 } from "openapi-types";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import type { ValuePathsObject } from "#/lib/declarative/common/openapi/openapi.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
import { toOperationPath } from "#/lib/declarative/common/google-aip/operation.ts";
import { toOperationSchema } from "#/lib/declarative/common/google-aip/mod.ts";

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
 * standardGetOf returns the standard Get operation of the resource.
 */
export function standardGetOf<TClass extends Class>(
  target: TClass,
): OpenAPIV3_1.OperationObject | undefined {
  return getPrototypeValue<ValueStandardGet>(target)?.paths?.[
    toStandardGetPath(target.name)
  ]?.get;
}

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
    const operationPath = toStandardGetPath(
      resourceName,
      options?.collectionIdentifier,
      options?.parent,
    );
    value ??= {} as TValue;
    value!.paths ??= {} as OpenAPIV3_1.PathsObject;
    value!.paths[operationPath] ??= {
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
  }/{name}`;
}

/**
 * StandardGetOptions is the options for the standard Get operation of the
 * resource.
 */
export interface StandardGetOptions extends OperationOptions {}

/**
 * ValueStandardGet is the value of the standard Get operation of the resource.
 */
export interface ValueStandardGet extends ValueJSONSchema, ValuePathsObject {}
