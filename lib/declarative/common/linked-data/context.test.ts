import { assertEquals } from "@std/assert";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { context } from "./context.ts";

const exampleContext = "http://example.com/";

@(await context(exampleContext))
class Example {}

Deno.test("Decorator context decorates value", () => {
  assertEquals(getPrototypeValue(Example), {
    context: exampleContext,
  });
});
