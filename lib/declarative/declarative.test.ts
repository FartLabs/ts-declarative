import { assertEquals } from "@std/assert";
import { DeclarativeStorageInMemory } from "./storage/in-memory.ts";
import {
  declarativeSequence,
  declareClass,
  getBaseValue,
  getClassID,
  setClassID,
} from "./declarative.ts";

interface Fake {
  foo?: string;
  bar?: string;
}

Deno.test("Two-part declare class operation", async (t) => {
  class Foo {}

  await t.step("Part 1 sets base value", () => {
    declareClass({
      target: Foo,
      prefix: "fake#",
      initialize: (): Fake => ({ foo: "foo" }),
    });
    assertEquals(getBaseValue<typeof Foo, Fake>(Foo), { foo: "foo" });
  });

  await t.step("Part 2 extends base value with initializer", () => {
    const storage = new DeclarativeStorageInMemory<Fake>();
    declareClass({
      target: Foo,
      prefix: "fake#",
      initialize: (): Fake => ({
        ...getBaseValue<typeof Foo, Fake>(Foo),
        bar: "bar",
      }),
      storage,
    });

    const classID = getClassID(Foo);
    assertEquals(classID, "fake#Foo");
    assertEquals(storage.get(classID!), { foo: "foo", bar: "bar" });
  });
});

Deno.test("Declarative declare class operation", async (t) => {
  class Foo {}

  await t.step("Get and set class ID", () => {
    assertEquals(getClassID(Foo), undefined);

    setClassID(Foo, "foo");
    assertEquals(getClassID(Foo), "foo");
  });

  await t.step("declareClass", () => {
    const storage = new DeclarativeStorageInMemory<Fake>();
    declareClass(
      {
        storage,
        prefix: "fake#",
        target: Foo,
        initialize: (): Fake => ({ foo: "foo" }),
      },
      (value) => ({ ...value, bar: "bar" }),
    );

    const classID = getClassID(Foo);
    assertEquals(classID, "fake#Foo");
    assertEquals(storage.get(classID!), { foo: "foo", bar: "bar" });
  });
});

Deno.test("declarativeSequence", () => {
  const declarative = declarativeSequence<Fake>((value) => ({
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

  setClassID(Foo, "foo");
  assertEquals(getClassID(Foo), "foo");
});
