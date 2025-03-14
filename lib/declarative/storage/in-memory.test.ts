import { assertEquals } from "@std/assert";
import { DeclarativeStorageInMemory } from "./in-memory.ts";

Deno.test("DeclarativeStorageInMemory", () => {
  const storage = new DeclarativeStorageInMemory<string>();
  storage.set("foo", "foo");
  assertEquals(storage.get("foo"), "foo");
  assertEquals(storage.get("bar"), undefined);
});
