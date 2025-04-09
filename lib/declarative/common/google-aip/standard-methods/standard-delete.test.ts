import { assertEquals } from "@std/assert";
import { standardDelete, standardDeleteOf } from "./standard-delete.ts";

@standardDelete({ resourcePath: "persons" })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardDelete decorator factory decorates value", () => {
  const actual = standardDeleteOf(Person);
  assertEquals(actual, {
    path: "/persons/{name}",
    httpMethod: "delete",
    specification: {
      parameters: [{ name: "name", in: "path", required: true }],
    },
  });
});
