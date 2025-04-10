import { assertEquals } from "@std/assert";
import { standardCreate, standardCreateOf } from "./standard-create.ts";

@standardCreate()
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardCreate decorator factory decorates value", () => {
  const actual = standardCreateOf(Person);
  assertEquals(actual, {
    description: "Creates Person",
    requestBody: {
      content: {
        "application/json": {
          schema: { "$ref": "#/components/schemas/Person" },
        },
      },
      description: "The Person to create",
      required: true,
    },
    responses: {
      "200": {
        content: {
          "application/json": {
            schema: { "$ref": "#/components/schemas/Person" },
          },
        },
        description: "The created Person",
      },
    },
  });
});
