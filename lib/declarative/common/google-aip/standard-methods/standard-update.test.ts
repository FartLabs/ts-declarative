import { assertEquals } from "@std/assert";
import { standardUpdate, standardUpdateOf } from "./standard-update.ts";

@standardUpdate()
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardUpdate decorator factory decorates value", () => {
  const actual = standardUpdateOf(Person);
  assertEquals(actual, {
    path: "/people/{name}",
    httpMethod: "post",
    description: "Updates Person",
    schema: {
      description: "The Person to update",
      parameters: [{ name: "name", in: "path", required: true }],
      requestBody: {
        content: {
          "application/json": {
            schema: { "$ref": "#/components/schemas/Person" },
          },
        },
        required: true,
      },
    },
  });
});
