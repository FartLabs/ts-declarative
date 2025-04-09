import { assertEquals } from "@std/assert";
import { standardGet, standardGetOf } from "./standard-get.ts";

@standardGet()
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardGet decorator factory decorates value", () => {
  const actual = standardGetOf(Person);
  assertEquals(actual, {
    path: "/people/{name}",
    httpMethod: "get",
    schema: {
      parameters: [{ name: "name", in: "path", required: true }],
    },
  });
});
