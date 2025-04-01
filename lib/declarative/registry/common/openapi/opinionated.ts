import type { Class } from "#/lib/declarative/declarative.ts";
import { MuxRegistry } from "#/lib/declarative/registry/mux.ts";
import {
  OpenAPISpecification,
} from "#/lib/declarative/registry/common/openapi/specification.ts";

/**
 * opinionatedOpenAPI creates an opinionated OpenAPI registry.
 */
export function opinionatedOpenAPI() {
  return new MuxRegistry([new OpenAPISpecification({})]);
}

/**
 * opinionatedResourceOptions creates options for registering an opinionated
 * OpenAPI resource.
 */
export function opinionatedResourceOptions(
  target: Class,
  options?: OpinionatedResourceOptions,
): OpinionatedResourceOptions {
  const { path, endpoints } = options ?? {};
  return {
    path: path ?? target.name,
    endpoints: endpoints ?? opinionatedResourceEndpoints,
  };
}

export interface OpinionatedResourceOptions {
  path?: string;
  endpoints?: OpinionatedResourceEndpointKind[];
}

export type OpinionatedResourceEndpointKind =
  typeof opinionatedResourceEndpoints[number];

const opinionatedResourceEndpoints = [
  "create",
  "read",
  "update",
  "delete",
  // "batchCreate", "batchRead", "batchUpdate", "batchDelete",
] as const satisfies string[];
