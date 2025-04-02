import type { Route } from "@std/http/unstable-route";
import { route } from "@std/http/unstable-route";
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
  public routes: Route[] = [];
  public db: Map<string, unknown> = new Map();

  public constructor(specification?: Partial<OpenAPIV3_1.Document>) {
    this.specification = Object.assign(
      {
        openapi: "3.1.0",
        info: { title: "Example API", version: "1.0.0" },
        paths: {},
      },
      specification,
    );
  }

  public register(target: Class, options?: OpenAPIResourceOptions): void {
    const jsonSchema = jsonSchemaOf(target);
    if (jsonSchema === undefined) {
      throw new Error("Target must have a JSON schema");
    }

    const { path, endpoints } = openapiResourceOptions(target, options);
    if (endpoints.create) {
      if (this.hasOperation(path, "post")) {
        throw new Error(`Path ${path} already has a create operation.`);
      }

      this.setCreateOperation(path, jsonSchema);
    }

    if (endpoints.read) {
      if (this.hasOperation(`${path}/{id}`, "get")) {
        throw new Error(`Path ${path}/{id} already has a read operation.`);
      }

      this.setReadOperation(path, jsonSchema);
    }

    if (endpoints.update) {
      if (this.hasOperation(`${path}/{id}`, "post")) {
        throw new Error(`Path ${path}/{id} already has a update operation.`);
      }

      this.setUpdateOperation(path, jsonSchema);
    }

    if (endpoints.delete) {
      if (this.hasOperation(`${path}/{id}`, "delete")) {
        throw new Error(`Path ${path}/{id} already has a delete operation.`);
      }

      this.setDeleteOperation(path);
    }
  }

  public fetch(request: Request): Response | Promise<Response> {
    const handle = route(this.routes, () => {
      return new Response(null, { status: 404 });
    });
    return handle(request);
  }

  public hasOperation(path: string, method: string): boolean {
    return Object.hasOwn(this.specification.paths?.[path] ?? {}, method);
  }

  public setOperation(
    path: string,
    method: string,
    data: OpenAPIV3_1.OperationObject,
  ): void {
    this.specification.paths ??= {};
    this.specification.paths[path] ??= {};
    Object.assign(this.specification.paths[path], { [method]: data });
  }

  public setCreateOperation<T>(path: string, jsonSchema: T): void {
    this.setOperation(path, "post", {
      requestBody: {
        content: {
          "application/json": {
            // TODO: Use $ref instead of schema directly.
            schema: jsonSchema as OpenAPIV3_1.SchemaObject,
          },
        },
      },
      responses: { "200": { description: "Created" } },
    });

    this.routes.push({
      pattern: new URLPattern({ pathname: path }),
      method: "POST",
      handler: async (request) => {
        const resource = await request.json();
        this.db.set(resource.id, resource);
        return new Response(null, { status: 200 });
      },
    });
  }

  public setReadOperation<T>(path: string, jsonSchema: T): void {
    this.setOperation(`${path}/{id}`, "get", {
      parameters: [idPathParameter],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: jsonSchema as OpenAPIV3_1.SchemaObject,
            },
          },
        },
      },
    });

    this.routes.push({
      pattern: new URLPattern({ pathname: `${path}/:id` }),
      method: "GET",
      handler: (_request, params) => {
        const id = params?.pathname.groups.id;
        if (id === undefined) {
          return new Response(null, { status: 404 });
        }

        const resource = this.db.get(id);
        if (resource === undefined) {
          return new Response(null, { status: 404 });
        }

        return new Response(JSON.stringify(resource), { status: 200 });
      },
    });
  }

  public setUpdateOperation<T>(path: string, jsonSchema: T): void {
    this.setOperation(`${path}/{id}`, "post", {
      parameters: [idPathParameter],
      requestBody: {
        content: {
          "application/json": {
            schema: jsonSchema as OpenAPIV3_1.SchemaObject,
          },
        },
      },
      responses: { "200": { description: "Updated" } },
    });

    this.routes.push({
      pattern: new URLPattern({ pathname: `${path}/:id` }),
      method: "POST",
      handler: async (request, params) => {
        const id = params?.pathname.groups.id;
        if (id === undefined) {
          return new Response(null, { status: 404 });
        }

        const resource = await request.json();
        this.db.set(id, resource);
        return new Response(null, { status: 200 });
      },
    });
  }

  public setDeleteOperation(path: string): void {
    this.setOperation(`${path}/{id}`, "delete", {
      parameters: [idPathParameter],
      responses: {
        "200": { description: "Deleted" },
      },
    });

    this.routes.push({
      pattern: new URLPattern({ pathname: `${path}/:id` }),
      method: "DELETE",
      handler: (_request, params) => {
        const id = params?.pathname.groups.id;
        if (id === undefined) {
          return new Response(null, { status: 404 });
        }

        this.db.delete(id);
        return new Response(null, { status: 200 });
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
