import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/paths-object.ts";
import { routesOf } from "#/lib/declarative/common/router/router.ts";
import { standardList } from "./standard-list.ts";

const kv = await Deno.openKv(":memory:");

@standardList({ kv })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardList decorator factory decorates value", () => {
  assertEquals(routesOf(Person).length, 1);
  assertEquals(
    pathsObjectOf(Person),
    {
      "/people": {
        get: {
          description: "Lists People",
          parameters: [
            { in: "query", name: "page_size" },
            { in: "query", name: "page_token" },
          ],
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    items: { $ref: "#/components/schemas/Person" },
                    type: "array",
                  },
                },
              },
              description: "List of People",
            },
          },
        },
      },
    },
  );
});
