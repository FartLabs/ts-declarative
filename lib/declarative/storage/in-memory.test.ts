import { assertEquals } from "@std/assert";
import { DeclarativeStorageInMemory } from "./in-memory.ts";

Deno.test("DeclarativeStorageInMemory", () => {
  const storage = new DeclarativeStorageInMemory<string>();
  storage.set("foo", "bar");
  assertEquals(storage.get("foo"), "bar");
  assertEquals(storage.get("baz"), undefined);
});
