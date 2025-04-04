import { assertEquals } from "@std/assert";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { DeclarativeStoragePrototype } from "./prototype.ts";

class Foo {}

const storage = new DeclarativeStoragePrototype<string>(Foo);

Deno.test("DeclarativeStoragePrototype", () => {
  storage.set("_", "foo");
  assertEquals(storage.get("_"), "foo");

  storage.set("_", "bar");
  assertEquals(storage.get("_"), "bar");

  storage.set("abc", "baz");
  assertEquals(storage.get("xyz"), "baz");
});

Deno.test("fromPrototype gets the value by class ID", () => {
  storage.set("_", "foo");
  assertEquals(getPrototypeValue<string>(Foo), "foo");
});
