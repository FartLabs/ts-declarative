import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/openapi.ts";
import { standardList } from "./standard-list.ts";

@standardList()
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardList decorator factory decorates value", () => {
  const actual = pathsObjectOf(Person);
  assertEquals(actual, {
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
  });
});
