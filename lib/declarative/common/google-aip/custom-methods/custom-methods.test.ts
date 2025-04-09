import { assertEquals } from "@std/assert";
import { customMethod, customMethodsOf } from "./custom-methods.ts";

@customMethod({
  verb: "batchCreate",
  resourcePath: "persons",
  input: { strategy: "body" },
  output: { description: "Created resources." },
})
class Person {
  public constructor(public name: string) {}
}

Deno.test("customMethod decorator factory decorates value", () => {
  const actual = customMethodsOf(Person);
  assertEquals(actual, [{
    path: "/persons:batchCreate",
    httpMethod: "post",
    specification: {
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
          description: "Created resources.",
        },
      },
    },
  }]);
});
