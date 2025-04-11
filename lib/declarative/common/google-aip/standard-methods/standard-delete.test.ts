import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/openapi.ts";
import { standardDelete } from "./standard-delete.ts";

@standardDelete()
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardDelete decorator factory decorates value", () => {
  const actual = pathsObjectOf(Person);
  assertEquals(actual, {
    "/people/{name}": {
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
  });
});
