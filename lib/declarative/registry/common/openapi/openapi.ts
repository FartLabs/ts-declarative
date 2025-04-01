import { MuxRegistry } from "#/lib/declarative/registry/mux.ts";
import { OpenAPISpecification } from "#/lib/declarative/registry/common/openapi/specification.ts";

export function openapi() {
  return new MuxRegistry([new OpenAPISpecification({})]);
}

// export function opinionatedResourceOptions() {}
