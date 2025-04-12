import { assertEquals } from "@std/assert";
import { Project } from "ts-morph";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { ValueTsMorphProperties } from "./ts-morph.ts";
import { tsMorphPropertiesDecoratorFactory } from "./ts-morph.ts";

const project = new Project({ useInMemoryFileSystem: true });
project.createSourceFile(
  import.meta.url,
  await Deno.readTextFile(new URL(import.meta.url)),
);
const tsMorph = tsMorphPropertiesDecoratorFactory(project);

@tsMorph(import.meta.url)
class Person {
  public constructor(public name: string) {}
}

Deno.test("tsMorph decorates value", () => {
  assertEquals(getPrototypeValue<ValueTsMorphProperties>(Person)?.properties, [{
    name: "name",
    type: "string",
    paramIndex: 0,
  }]);
});
