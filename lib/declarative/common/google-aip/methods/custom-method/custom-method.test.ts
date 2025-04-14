import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/paths-object.ts";
import { routesOf } from "#/lib/declarative/common/router/router.ts";
import { customMethod } from "./custom-method.ts";

@customMethod({
  name: "batchCreate",
  description: "Create people",
  request: { description: "People to create" },
  response: { description: "Created people" },
  handler: () => new Response("[]"),
})
class Person {
  public constructor(public name: string) {}
}

Deno.test("customMethod decorator factory decorates value", () => {
  assertEquals(routesOf(Person).length, 1);
  assertEquals(
    pathsObjectOf(Person),
    {
      "/people:batchCreate": {
        post: {
          description: "Create people",
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Person" },
              },
            },
            required: true,
          },
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Person" },
                },
              },
              description: "Created people",
            },
          },
        },
      },
    },
  );
});
