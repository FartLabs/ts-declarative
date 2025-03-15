import { assertEquals } from "@std/assert";
import { DeclarativeStorageInMemory } from "./storage/in-memory.ts";
import { getPrototypeID } from "./declarative.ts";
import { createDecoratorFactory } from "./decorator.ts";

interface Fake {
  foo?: string;
  bar?: string;
}

Deno.test("Declarative decorator factory", () => {
  const storage = new DeclarativeStorageInMemory<Fake>();
  const declarative = createDecoratorFactory(
    { storage, prefix: "fake#", initialize: (): Fake => ({ foo: "foo" }) },
    (value) => ({ ...value, bar: "bar" }),
  );

  @declarative()
  class Foo {}

  const id = getPrototypeID(Foo);
  assertEquals(id, "fake#Foo");
  assertEquals(storage.get(id!), {
    foo: "foo",
    bar: "bar",
  });
});
