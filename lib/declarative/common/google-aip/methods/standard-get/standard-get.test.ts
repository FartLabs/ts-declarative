import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/paths-object.ts";
import { routesOf } from "#/lib/declarative/common/router/router.ts";
import { standardGet } from "./standard-get.ts";

const kv = await Deno.openKv(":memory:");

@standardGet({ kv })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardGet decorator factory decorates value", () => {
  assertEquals(routesOf(Person).length, 1);
  assertEquals(
    pathsObjectOf(Person),
    {
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
    },
  );
});
