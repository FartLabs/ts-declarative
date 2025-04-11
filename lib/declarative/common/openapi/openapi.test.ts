import { assertEquals } from "@std/assert/equals";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";
import {
  standardCreate,
  standardGet,
} from "#/lib/declarative/common/google-aip/mod.ts";
import { openapi, specificationOf } from "./openapi.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@standardCreate()
@standardGet()
@jsonSchema()
class Person {
  public constructor(public name: string) {}
}

@openapi({
  specification: {
    openapi: "3.0.1",
    info: { title: "App", version: "0.0.1" },
    components: {},
  },
  resources: [Person],
})
class App {}

Deno.test("openapi decorator decorates value", () => {
  const specification = specificationOf(App);
  assertEquals(specification?.paths, {
    "/people": {
      post: {
        description: "Creates Person",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Person" },
            },
          },
          description: "The Person to create",
          required: true,
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Person" },
              },
            },
            description: "The created Person",
          },
        },
      },
    },
    "/people/{name}": {
      get: {
        description: "Gets Person",
        parameters: [
          {
            in: "path",
            name: "name",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Person" },
              },
            },
            description: "Got Person",
          },
        },
      },
    },
  });
});
