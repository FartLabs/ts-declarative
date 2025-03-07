import { assertEquals } from "@std/assert";
import { DeclarativeStorageInMemory } from "./storage/in-memory.ts";
import { getClassID } from "./declarative.ts";
import { createDecoratorFactory } from "./decorator.ts";

interface Fake {
  foo?: string;
  bar?: string;
}

Deno.test("Declarative decorator factory", () => {
  const storage = new DeclarativeStorageInMemory<Fake>();
  const declarative = createDecoratorFactory(
    { storage, prefix: "fake", initialize: (): Fake => ({ foo: "foo" }) },
    (value) => ({ ...value, bar: "bar" }),
  );

  @declarative()
  class Foo {}

  assertEquals(storage.get(getClassID(Foo)!), {
    foo: "foo",
    bar: "bar",
  });
});
