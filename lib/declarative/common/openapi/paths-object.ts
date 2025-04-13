import type { OpenAPIV3_1 } from "openapi-types";
import type { Class } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";

/**
 * pathsObjectOf returns the paths object of the OpenAPI class.
 */
export function pathsObjectOf<TClass extends Class>(
  target: TClass,
): OpenAPIV3_1.PathsObject | undefined {
  return getPrototypeValue<ValuePathsObject>(target)?.paths;
}

/**
 * reducePathsObject reduces the paths object of the OpenAPI
 * specification.
 */
export function reducePathsObject(
  paths: OpenAPIV3_1.PathsObject,
  pathsObject: OpenAPIV3_1.PathsObject,
): OpenAPIV3_1.PathsObject {
  for (const path in pathsObject) {
    paths[path] = { ...paths[path], ...pathsObject[path] };
  }

  return paths;
}

/**
 * ValuePathsObject is the value of the paths object of the OpenAPI
 * specification.
 */
export interface ValuePathsObject {
  /**
   * paths is the paths object of the OpenAPI specification.
   */
  paths?: OpenAPIV3_1.PathsObject;
}
