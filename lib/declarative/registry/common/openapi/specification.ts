// import { slugify } from "@std/text/unstable-slugify";
import type { Class } from "#/lib/declarative/declarative.ts";
import { getPrototypeID } from "#/lib/declarative/declarative.ts";
import type { Registry } from "#/lib/declarative/registry/registry.ts";
import { jsonSchemaOf } from "#/lib/declarative/common/json-schema/json-schema.ts";

/**
 * OpenAPISpecification is a registry for OpenAPI resources that builds an
 * OpenAPI specification.
 */
export class OpenAPISpecification implements Registry<OpenAPIResourceOptions> {
  // deno-lint-ignore no-explicit-any
  public constructor(public specification: any) {}

  public register(target: Class, _options?: OpenAPIResourceOptions): void {
    const id = getPrototypeID(target);
    if (id === undefined) {
      throw new Error("Target must be a class");
    }

    const jsonSchema = jsonSchemaOf(target);
    if (jsonSchema === undefined) {
      throw new Error("Target must have a JSON schema");
    }

    // TODO: Define CRUD endpoints on base path.
    // TODO: Generate client library with oazapfts.
    // const path = options?.path ?? slugify(id);

    throw new Error("Not implemented.");
  }
}

/**
 * OpenAPIResourceOptions are options for registering an OpenAPI resource.
 */
export interface OpenAPIResourceOptions {
  path?: string;
}
