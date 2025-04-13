import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/paths-object.ts";
import { routesOf } from "#/lib/declarative/common/router/router.ts";
import { standardDelete } from "./standard-delete.ts";

const kv = await Deno.openKv(":memory:");

@standardDelete({ kv })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardDelete decorator factory decorates value", () => {
  assertEquals(routesOf(Person).length, 1);
  assertEquals(
    pathsObjectOf(Person),
    {
      "/people/{person}": {
        delete: {
          description: "Deletes Person",
          parameters: [
            {
              in: "path",
              name: "name",
              required: true,
            },
          ],
          responses: {
            "200": {
              description: "The deleted Person",
            },
          },
        },
      },
    },
  );
});
