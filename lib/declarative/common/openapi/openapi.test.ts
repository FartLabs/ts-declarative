import { assertEquals } from "@std/assert/equals";
import {
  standardCreate,
  standardGet,
} from "#/lib/declarative/common/google-aip/methods/mod.ts";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";
import { openapi, specificationOf } from "./openapi.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

@standardCreate()
@standardGet()
@autoSchema()
class Person {
  public constructor(public name: string) {}
}

@openapi({ resources: [Person] })
class App {}

Deno.test("openapi decorator decorates value", () => {
  const specification = specificationOf(App);
  assertEquals(specification?.info.title, "App");
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
    "/people/{person}": {
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
