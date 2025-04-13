import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/openapi.ts";
import { standardUpdate } from "./standard-update.ts";

@standardUpdate()
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardUpdate decorator factory decorates value", () => {
  const actual = pathsObjectOf(Person);
  assertEquals(actual, {
    "/people/{person}": {
      post: {
        description: "Updates Person",
        parameters: [{ in: "path", name: "name", required: true }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Person" },
            },
          },
          description: "The Person to update",
          required: true,
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Person" },
              },
            },
            description: "The updated Person",
          },
        },
      },
    },
  });
});
