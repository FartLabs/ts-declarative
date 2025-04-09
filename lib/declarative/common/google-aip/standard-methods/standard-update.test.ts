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
    schema: {
      parameters: [{ name: "name", in: "path", required: true }],
    },
  });
});
