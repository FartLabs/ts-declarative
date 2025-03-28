import { assertEquals } from "@std/assert";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { type } from "./type.ts";

const exampleType = "MyExample";

@type(exampleType)
class Example {}

Deno.test("Decorator type decorates value", () => {
  assertEquals(getPrototypeValue(Example), {
    type: exampleType,
  });
});
