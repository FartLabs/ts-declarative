import type { Route } from "@std/http/unstable-route";
import { slugify } from "@std/text/unstable-slugify";
import type { OpenAPIV3_1 } from "openapi-types";
import type { Class } from "#/lib/declarative/declarative.ts";
import type { Registry } from "#/lib/declarative/registry/registry.ts";
import { jsonSchemaOf } from "#/lib/declarative/common/json-schema/json-schema.ts";

/**
 * OpenAPIServer is a registry for OpenAPI resources that builds an
 * OpenAPI specification.
 */
export class OpenAPIServer implements Registry {
  public specification: OpenAPIV3_1.Document;
  public routes: Route[] = []; // TODO: Append routes on register.

  public constructor(specification?: Partial<OpenAPIV3_1.Document>) {
    this.specification = {
      ...specification,
      openapi: specification?.openapi ?? "3.1.0",
      info: specification?.info ?? { title: "Example API", version: "1.0.0" },
      paths: specification?.paths ?? {},
    };
  }

  public register(target: Class, options?: OpenAPIResourceOptions): void {
    const jsonSchema = jsonSchemaOf(target);
    if (jsonSchema === undefined) {
      throw new Error("Target must have a JSON schema");
    }

    const { path, endpoints } = openapiResourceOptions(target, options);
    if (endpoints.create) {
      const operationPath = operationPathOf(path, "create");
      {
        if (this.hasOperation(operationPath, methodOf("create"))) {
          throw new Error(
            `Path ${operationPath} already has a create operation.`,
          );
        }

        this.setCreateOperation(operationPath, jsonSchema);
      }

      if (endpoints.read) {
        const operationPath = operationPathOf(path, "read");
        if (this.hasOperation(operationPath, methodOf("read"))) {
          throw new Error(
            `Path ${operationPath} already has a read operation.`,
          );
        }

        this.setReadOperation(operationPath, jsonSchema);
      }

      if (endpoints.update) {
        const operationPath = operationPathOf(path, "update");
        if (this.hasOperation(operationPath, methodOf("update"))) {
          throw new Error(
            `Path ${operationPath} already has an update operation.`,
          );
        }

        this.setUpdateOperation(operationPath, jsonSchema);
      }

      if (endpoints.delete) {
        const operationPath = operationPathOf(path, "delete");
        if (this.hasOperation(operationPath, methodOf("delete"))) {
          throw new Error(
            `Path ${operationPath} already has a delete operation.`,
          );
        }

        this.setDeleteOperation(operationPath);
      }
    }
  }

  public hasOperation(path: string, method: string): boolean {
    return Object.hasOwn(this.specification.paths?.[path] ?? {}, method);
  }

  // deno-lint-ignore no-explicit-any
  public setOperation(path: string, method: string, data: any): void {
    this.specification.paths ??= {};
    this.specification.paths[path] ??= {};
    this.specification.paths[path][method as ReturnType<typeof methodOf>] =
      data;
  }

  public setCreateOperation<T>(path: string, jsonSchema: T): void {
    this.setOperation(path, methodOf("create"), {
      requestBody: {
        content: {
          // TODO: Use $ref instead of schema directly.
          "application/json": { schema: jsonSchema },
        },
      },
      responses: { "200": { description: "Created" } },
    });
  }

  public setReadOperation<T>(path: string, jsonSchema: T): void {
    this.setOperation(path, methodOf("read"), {
      parameters: [idPathParameter],
      responses: {
        "200": {
          description: "OK",
          content: {
            // TODO: Use $ref instead of schema directly.
            "application/json": { schema: jsonSchema },
          },
        },
      },
    });
  }

  public setUpdateOperation<T>(path: string, jsonSchema: T): void {
    this.setOperation(path, methodOf("update"), {
      parameters: [idPathParameter],
      requestBody: {
        content: { "application/json": { schema: jsonSchema } },
      },
      responses: { "200": { description: "Updated" } },
    });
  }

  public setDeleteOperation(path: string): void {
    this.setOperation(path, methodOf("delete"), {
      parameters: [idPathParameter],
      responses: {
        "200": { description: "Deleted" },
      },
    });
  }
}

const idPathParameter: OpenAPIV3_1.ParameterObject = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string" },
};

/**
 * openapiResourceOptions creates options for registering an opinionated
 * OpenAPI resource.
 */
export function openapiResourceOptions(
  target: Class,
  options?: OpenAPIResourceOptions,
): Required<OpenAPIResourceOptions> {
  const { path, endpoints } = options ?? {};
  return {
    path: path ?? `/${slugify(target.name)}`,
    endpoints: { ...defaultOpenAPIResourceEndpointKinds(), ...endpoints },
  };
}

/**
 * OpenAPIResourceOptions are options for registering a resource and its
 * endpoints on an OpenAPI specification.
 */
export interface OpenAPIResourceOptions {
  path?: string;
  endpoints?: Record<OpenAPIResourceEndpointKind, boolean>;
}

export function methodOf(
  endpointKind: OpenAPIResourceEndpointKind,
): "get" | "post" | "delete" {
  switch (endpointKind) {
    case "create": {
      return "post";
    }

    case "read": {
      return "get";
    }

    case "update": {
      return "post";
    }

    case "delete": {
      return "delete";
    }

    default: {
      throw new Error(`Unknown endpoint kind: ${endpointKind}`);
    }
  }
}

export function operationPathOf(
  prefix: string,
  endpointKind: OpenAPIResourceEndpointKind,
): string {
  switch (endpointKind) {
    case "create": {
      return prefix;
    }

    case "read":
    case "update":
    case "delete": {
      return `${prefix}/{id}`;
    }
  }
}

export function defaultOpenAPIResourceEndpointKinds(): Record<
  OpenAPIResourceEndpointKind,
  boolean
> {
  return Object.fromEntries(
    openapiResourceEndpointKinds.map((endpoint) => {
      return [endpoint, true];
    }),
  ) as Record<OpenAPIResourceEndpointKind, boolean>;
}

export type OpenAPIResourceEndpointKind =
  (typeof openapiResourceEndpointKinds)[number];

export const openapiResourceEndpointKinds: [
  "create",
  "read",
  "update",
  "delete",
] = [
  "create",
  "read",
  "update",
  "delete",
  // "batchCreate", "batchRead", "batchUpdate", "batchDelete",
];
