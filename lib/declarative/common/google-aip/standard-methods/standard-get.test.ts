import { assertEquals } from "@std/assert";
import { standardGet, standardGetOf } from "./standard-get.ts";

@standardGet({ resourcePath: "persons" })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardGet decorator factory decorates value", () => {
  const actual = standardGetOf(Person);
  assertEquals(actual, {
    path: "/persons/{name}",
    method: "get",
    value: {
      parameters: [{ name: "name", in: "path", required: true }],
    },
  });
});
