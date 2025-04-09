import type { OpenAPIV3_1 } from "openapi-types";
import { toCollectionIdentifier } from "./to-collection-identifier.ts";

/**
 * Operation is an operation of an OpenAPI specification.
 */
export interface Operation {
  /**
   * path is the path of the operation.
   */
  path: string;

  /**
   * httpMethod is the HTTP method of the operation.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
   */
  httpMethod: string;

  /**
   * schema is the OpenAPI specification of the operation.
   */
  schema: OpenAPIV3_1.OperationObject;
}

/**
 * OperationRequest is the request of an operation.
 */
export interface OperationRequest {
  /**
   * schema is the OpenAPI specification of the response.
   */
  // deno-lint-ignore no-explicit-any
  schema?: any;

  /**
   * strategy is the strategy of the request payload.
   */
  strategy?: "body" | "query";

  /**
   * description is the description of the request.
   */
  description?: string;
}

/**
 * Operationresponse is the response of an operation.
 */
export interface OperationResponse {
  /**
   * schema is the OpenAPI specification of the response.
   */
  // deno-lint-ignore no-explicit-any
  schema?: any;

  /**
   * description is the description of the response.
   */
  description?: string;
}

/**
 * OperationOptions is the options for the operation of the resource.
 */
export interface OperationOptions {
  /**
   * parent is the parent path of the resource.
   */
  parent?: string;

  /**
   * resourceName is the name of the resource. If unspecified, the name of the
   * resource is inferred.
   */
  resourceName?: string;

  /**
   * collectionIdentifier is the collection identifier of the resource. If
   * unspecified, the pluralized name of the resource is used.
   */
  collectionIdentifier?: string;
}

/**
 * toPath returns the path of an operation.
 */
export function toPath(
  resourceName: string,
  options?: OperationOptions,
): string {
  return `${options?.parent ?? ""}/${
    options?.collectionIdentifier ??
      toCollectionIdentifier(options?.resourceName ?? resourceName)
  }`;
}
