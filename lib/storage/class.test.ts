import { assertEquals } from "@std/assert";
import { getClassID, setClassID } from "./class.ts";

Deno.test("Get and set class ID", () => {
  class Foo {}
  assertEquals(getClassID(Foo), undefined);

  setClassID(Foo, "foo");
  assertEquals(getClassID(Foo), "foo");
});
