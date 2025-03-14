import { assertEquals } from "@std/assert";
import { DeclarativeStoragePrototype } from "./prototype.ts";

Deno.test("DeclarativeStoragePrototype", () => {
  class Foo {}
  const storage = new DeclarativeStoragePrototype<typeof Foo, string>(Foo);
  storage.set("foo", "foo");
  assertEquals(storage.get("foo"), "foo");
  assertEquals(storage.get("bar"), undefined);
});
