import { assertEquals } from "@std/assert";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { tsMorph } from "./ts-morph.ts";

@(await tsMorph(new URL(import.meta.url)))
class Person {
  public constructor(public name: string) {}
}

Deno.test("tsMorph decorates value", () => {
  assertEquals(getPrototypeValue(Person), {
    tsMorph: {
      properties: [{ name: "name", type: "string", paramIndex: 0 }],
    },
  });
});
