import type { OpenAPIV3_1 } from "openapi-types";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import { jsonSchemaOf } from "#/lib/declarative/common/json-schema/json-schema.ts";
import { pathsObjectOf, reducePathsObject } from "./paths-object.ts";

/**
 * specificationOf returns the OpenAPI specification of the class.
 */
export function specificationOf<TClass extends Class>(
  target: TClass,
): OpenAPIV3_1.Document | undefined {
  return getPrototypeValue<ValueOpenAPISpecification>(target)?.specification;
}

/**
 * openapiSpec is the decorator for OpenAPI specification.
 */
export const openapiSpec: (
  options?: OpenAPISpecificationDecoratorOptions,
) => (target: Class) => Class = createOpenAPISpecificationDecoratorFactory();

/**
 * createOpenAPISpecificationDecoratorFactory is the factory function for the
 * OpenAPI decorator.
 */
export function createOpenAPISpecificationDecoratorFactory(): (
  options?: OpenAPISpecificationDecoratorOptions | undefined,
) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: (options?: OpenAPISpecificationDecoratorOptions) => {
      return [declarativeOpenAPISpecification(options)];
    },
  });
}

/**
 * OpenAPISpecificationDecoratorOptions is the options for the OpenAPI
 * specification decorator.
 */
export interface OpenAPISpecificationDecoratorOptions {
  /**
   * specification is the base OpenAPI specification.
   */
  specification?: Partial<OpenAPIV3_1.Document>;

  /**
   * resources are the resources of the OpenAPI specification.
   */
  resources?: Class[];
}

/**
 * defaultOpenAPI is the default OpenAPI version.
 */
export const defaultOpenAPI = "3.0.1";

/**
 * defaultOpenAPIInfoVersion is the default OpenAPI info version.
 */
export const defaultOpenAPIInfoVersion = "1.0.0";

/**
 * declarativeOpenAPISpecification is the declarative function for OpenAPI specification.
 */
export function declarativeOpenAPISpecification<
  TValue extends ValueOpenAPISpecification,
>(
  options?: OpenAPISpecificationDecoratorOptions,
): Declarative<TValue> {
  return (value, name) => {
    return {
      ...value,
      specification: {
        ...options?.specification,
        openapi: options?.specification?.openapi ?? defaultOpenAPI,
        info: {
          ...options?.specification?.info,
          title: options?.specification?.info?.title ?? name,
          version: options?.specification?.info?.version ??
            defaultOpenAPIInfoVersion,
        },
        paths: {
          ...options?.specification?.paths,
          ...(options?.resources
            ?.map((resource) => {
              const pathsObject = pathsObjectOf(resource);
              if (pathsObject === undefined) {
                throw new Error(`pathsObject is required for ${resource.name}`);
              }

              return pathsObject;
            })
            .reduce(reducePathsObject, {}) ?? {}),
        },
        components: {
          ...options?.specification?.components,
          schemas: {
            ...options?.specification?.components?.schemas,
            ...Object.fromEntries(
              options?.resources?.map((resource) => {
                const jsonSchema = jsonSchemaOf(resource);
                if (jsonSchema === undefined) {
                  throw new Error(
                    `jsonSchema is required for ${resource.name}`,
                  );
                }

                return [resource.name, jsonSchema];
              }) ?? [],
            ),
          },
        },
      },
    } as TValue;
  };
}

/**
 * ValueOpenAPISpecification is the value associated with an OpenAPI specification.
 */
export interface ValueOpenAPISpecification {
  /**
   * specification is the top-level object of the OpenAPI specification.
   */
  specification?: OpenAPIV3_1.Document;
}
