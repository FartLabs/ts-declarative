import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/openapi.ts";
import { standardGet } from "./standard-get.ts";

@standardGet()
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardGet decorator factory decorates value", () => {
  const actual = pathsObjectOf(Person);
  assertEquals(actual, {
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
