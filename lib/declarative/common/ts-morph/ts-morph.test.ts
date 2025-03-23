import { assertEquals } from "@std/assert";
import { Project } from "ts-morph";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { ValueTsMorph } from "./ts-morph.ts";
import { tsMorphDecoratorFactory } from "./ts-morph.ts";

const project = new Project({ useInMemoryFileSystem: true });
project.createSourceFile(
  import.meta.url,
  await Deno.readTextFile(new URL(import.meta.url)),
);
const tsMorph = tsMorphDecoratorFactory(project);

@tsMorph(import.meta.url)
class Person {
  public constructor(public name: string) {}
}

Deno.test("tsMorph decorates value", () => {
  assertEquals(getPrototypeValue<ValueTsMorph>(Person)?.tsMorph, {
    properties: [{ name: "name", type: "string", paramIndex: 0 }],
  });
});
