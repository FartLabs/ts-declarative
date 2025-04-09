import { assertEquals } from "@std/assert";
import { standardList, standardListOf } from "./standard-list.ts";

@standardList()
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardList decorator factory decorates value", () => {
  const actual = standardListOf(Person);
  assertEquals(actual, {
    path: "/people",
    httpMethod: "get",
    specification: {
      parameters: [{ in: "query", name: "page_size" }],
      responses: {
        "200": {
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Person" },
              },
            },
          },
          description: "List of resources.",
        },
      },
    },
  });
});
