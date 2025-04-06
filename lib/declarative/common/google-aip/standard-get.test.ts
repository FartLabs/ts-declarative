import { assertEquals } from "@std/assert";
import { standardGet, standardGetOf } from "./standard-get.ts";

@standardGet({ path: "/persons" })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardGet decorator factory decorates value", () => {
  const actual = standardGetOf(Person);
  assertEquals(actual, {
    path: "/persons/{name}",
    operation: {
      parameters: [{ name: "name", in: "path", required: true }],
    },
  });
});
