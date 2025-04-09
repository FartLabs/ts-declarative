import { assertEquals } from "@std/assert";
import { customMethod, customMethodsOf } from "./custom-methods.ts";

@customMethod({
  name: "batchCreate",
  description: "Create people",
  request: { description: "People to create" },
  response: { description: "Created people" },
})
class Person {
  public constructor(public name: string) {}
}

Deno.test("customMethod decorator factory decorates value", () => {
  const actual = customMethodsOf(Person);
  assertEquals(actual, [
    {
      path: "/people:batchCreate",
      httpMethod: "post",
      description: "Create people",
      schema: {
        description: "People to create",
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
            description: "Created people",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Person" },
              },
            },
          },
        },
      },
    },
  ]);
});
