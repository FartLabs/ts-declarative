import { assertEquals } from "@std/assert";
import { DeclarativeStoragePrototype, fromPrototype } from "./prototype.ts";
import { setClassID } from "#/lib/declarative/declarative.ts";

class Foo {}
setClassID(Foo, "Foo");
const storage = new DeclarativeStoragePrototype<typeof Foo, string>(Foo);
storage.set("Foo", "foo");

Deno.test("DeclarativeStoragePrototype", () => {
  assertEquals(storage.get("Foo"), "foo");
  assertEquals(storage.get("Bar"), undefined);
});

Deno.test("fromPrototype gets the value by class ID", () => {
  assertEquals(fromPrototype<typeof Foo, string>(Foo), "foo");
});
