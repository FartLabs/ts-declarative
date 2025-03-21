import { assertEquals } from "@std/assert";
import { DeclarativeStorageInMemory } from "./storage/in-memory.ts";
import {
  declarativeSequence,
  declareClass,
  getPrototypeID,
  getPrototypeValue,
  setPrototypeID,
} from "./declarative.ts";

interface FooBar {
  foo?: string;
  bar?: string;
}

Deno.test("Two-part declare class operation", async (t) => {
  class Foo {}

  await t.step("Part 1 sets base value", () => {
    declareClass({
      target: Foo,
      prefix: "example#",
      defaultValue: (): FooBar => ({ foo: "foo" }),
    });
    assertEquals(getPrototypeValue<FooBar>(Foo), { foo: "foo" });
  });

  await t.step("Part 2 extends base value with initializer", () => {
    const storage = new DeclarativeStorageInMemory<FooBar>();
    declareClass({
      target: Foo,
      prefix: "example#",
      defaultValue: (): FooBar => ({
        ...getPrototypeValue<FooBar>(Foo),
        bar: "bar",
      }),
      storage,
    });

    const classID = getPrototypeID(Foo);
    assertEquals(classID, "example#Foo");
    assertEquals(storage.get(classID!), { foo: "foo", bar: "bar" });
  });
});

Deno.test("Declarative declare class operation", async (t) => {
  class Foo {}

  await t.step("Get and set class ID", () => {
    assertEquals(getPrototypeID(Foo), undefined);

    setPrototypeID(Foo, "foo");
    assertEquals(getPrototypeID(Foo), "foo");
  });

  await t.step("declareClass", () => {
    const storage = new DeclarativeStorageInMemory<FooBar>();
    declareClass(
      {
        storage,
        prefix: "example#",
        target: Foo,
        defaultValue: (): FooBar => ({ foo: "foo" }),
      },
      (value) => ({ ...value, bar: "bar" }),
    );

    const classID = getPrototypeID(Foo);
    assertEquals(classID, "example#Foo");
    assertEquals(storage.get(classID!), { foo: "foo", bar: "bar" });
  });
});

Deno.test("declarativeSequence", () => {
  const declarative = declarativeSequence<FooBar>((value) => ({
    ...value,
    bar: "bar",
  }));

  assertEquals(declarative({ foo: "foo" }, "name"), {
    foo: "foo",
    bar: "bar",
  });
});

Deno.test("Set and get base value of class", () => {
  class Foo {}

  setPrototypeID(Foo, "foo");
  assertEquals(getPrototypeID(Foo), "foo");
});
