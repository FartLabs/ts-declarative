import { assertEquals } from "@std/assert/equals";
import {
  standardCreate,
  standardGet,
} from "#/lib/declarative/common/google-aip/mod.ts";
import { openapi } from "./openapi.ts";

@standardCreate()
@standardGet()
class Person {
  public constructor(public name: string) {}
}

@openapi()
class App {}

Deno.test("openapi decorator decorates value", () => {
});
