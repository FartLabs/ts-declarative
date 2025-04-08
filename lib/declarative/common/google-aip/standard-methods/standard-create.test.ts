import { assertEquals } from "@std/assert";
import { standardCreate, standardCreateOf } from "./standard-create.ts";

@standardCreate({ path: "/persons", input: { strategy: "body" } })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardCreate decorator factory decorates value", () => {
  const actual = standardCreateOf(Person);
  assertEquals(actual, {
    path: "/persons",
    method: "post",
    value: {
      requestBody: {
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
          description: "Created resource.",
        },
      },
    },
  });
});
