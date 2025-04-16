import { assertEquals } from "@std/assert";
import { DeclarativeStorageInMemory } from "./storage/in-memory.ts";
import { getPrototypeID, getPrototypeValue } from "./declarative.ts";
import { createDecoratorFactory, declarative } from "./decorator.ts";

interface Fake {
  foo?: string;
  bar?: string;
  baz?: string;
}

Deno.test("Declarative decorator factory", () => {
  const storage = new DeclarativeStorageInMemory<Fake>();
  const example = createDecoratorFactory({
    storage,
    prefix: "example#",
    initialize: () => {
      return [(value) => ({ ...value, bar: "bar" })];
    },
  });

  @example()
  class Foo {}

  const id = getPrototypeID(Foo);
  assertEquals(id, "example#Foo");
  assertEquals(storage.get(id!), {
    bar: "bar",
  });
});

Deno.test("Declarative decorator factory chaining", () => {
  const fooBar = createDecoratorFactory({
    prefix: "example#",
    initialize: () => {
      return [
        (value: Fake | undefined) => ({ ...value, foo: "foo", bar: "bar" }),
      ];
    },
  });
  const baz = createDecoratorFactory({
    prefix: "example#",
    initialize: () => {
      return [(value: Fake | undefined) => ({ ...value, baz: "baz" })];
    },
  });

  @baz()
  @fooBar()
  class Example0 {}

  assertEquals(getPrototypeID(Example0), "example#Example0");
  assertEquals(getPrototypeValue<Fake>(Example0), {
    foo: "foo",
    bar: "bar",
    baz: "baz",
  });

  @fooBar()
  @baz()
  class Example1 {}

  assertEquals(getPrototypeID(Example1), "example#Example1");
  assertEquals(getPrototypeValue<Fake>(Example1), {
    foo: "foo",
    bar: "bar",
    baz: "baz",
  });
});

Deno.test("Declarative decorator factory currying", () => {
  @declarative([
    (value) => ({ ...value, foo: "foo" }),
    (value) => ({ ...value, bar: "bar" }),
  ])
  class Foo {}

  assertEquals(getPrototypeValue<Fake>(Foo), { foo: "foo", bar: "bar" });
});
