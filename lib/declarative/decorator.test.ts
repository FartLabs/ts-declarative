import { assertEquals } from "@std/assert";
import { DeclarativeStorageInMemory } from "./storage/in-memory.ts";
import { getPrototypeID, getPrototypeValue } from "./declarative.ts";
import { createDecoratorFactory } from "./decorator.ts";

interface Fake {
  foo?: string;
  bar?: string;
  baz?: string;
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

// TODO: Test-driven development. Make the test pass.
Deno.test("Declarative decorator factory chaining", () => {
  const fooBar = createDecoratorFactory(
    { prefix: "ex#", initialize: (): Fake => ({ foo: "foo" }) },
    (value) => ({ ...value, bar: "bar" }),
  );
  const baz = createDecoratorFactory(
    { prefix: "ex#", initialize: (): Fake => ({}) },
    (value) => ({ ...value, baz: "baz" }),
  );

  @baz()
  @fooBar()
  class Example0 {}

  assertEquals(getPrototypeID(Example0), "ex#Example0");
  assertEquals(getPrototypeValue<Fake>(Example0), {
    foo: "foo",
    bar: "bar",
    baz: "baz",
  });

  @fooBar()
  @baz()
  class Example1 {}

  assertEquals(getPrototypeID(Example1), "ex#Example1");
  assertEquals(getPrototypeValue<Fake>(Example1), {
    foo: "foo",
    bar: "bar",
    baz: "baz",
  });
});
