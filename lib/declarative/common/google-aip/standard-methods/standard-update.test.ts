import { assertEquals } from "@std/assert";
import { standardUpdate, standardUpdateOf } from "./standard-update.ts";

@standardUpdate({ resourcePath: "persons" })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardUpdate decorator factory decorates value", () => {
  const actual = standardUpdateOf(Person);
  assertEquals(actual, {
    path: "/persons/{name}",
    method: "post",
    value: {
      parameters: [{ name: "name", in: "path", required: true }],
    },
  });
});
