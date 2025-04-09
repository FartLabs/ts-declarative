import { assertEquals } from "@std/assert";
import { standardCreate, standardCreateOf } from "./standard-create.ts";

@standardCreate({ request: { strategy: "body" } })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardCreate decorator factory decorates value", () => {
  const actual = standardCreateOf(Person);
  assertEquals(actual, {
    path: "/people",
    httpMethod: "post",
    description: "Creates Person",
    schema: {
      requestBody: {
        description: "The Person to create",
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Person" },
          },
        },
      },
      responses: {
        "200": {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Person" },
            },
          },
          description: "Created Person",
        },
      },
    },
  });
});
