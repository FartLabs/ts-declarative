import { assertEquals } from "@std/assert";
import { standardGet, standardGetOf } from "./standard-get.ts";

@standardGet()
class Person {
  public constructor(public name: string) {}
}

// TODO: Refactor standardCreate.
Deno.test("standardGet decorator factory decorates value", () => {
  const actual = standardGetOf(Person);
  assertEquals(actual, {
    description: "Gets Person",
    parameters: [
      {
        in: "path",
        name: "name",
        required: true,
        schema: {
          type: "string",
        },
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
  });
});
