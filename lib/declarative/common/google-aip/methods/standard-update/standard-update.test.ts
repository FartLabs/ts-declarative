import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/paths-object.ts";
import { routesOf } from "#/lib/declarative/common/router/router.ts";
import { standardUpdate } from "./standard-update.ts";

const kv = await Deno.openKv(":memory:");

@standardUpdate({ kv })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardUpdate decorator factory decorates value", () => {
  assertEquals(routesOf(Person).length, 1);
  assertEquals(
    pathsObjectOf(Person),
    {
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
    },
  );
});
