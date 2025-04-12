import { assertEquals } from "@std/assert";
import { Project } from "ts-morph";
import { typeInfoDecoratorFactory, typeInfoOf } from "./type-info.ts";

const project = new Project({ useInMemoryFileSystem: true });
project.createSourceFile(
  import.meta.url,
  await Deno.readTextFile(new URL(import.meta.url)),
);
const typeInfo = typeInfoDecoratorFactory(project);

@typeInfo(import.meta.url)
class Person {
  public constructor(public name: string) {}
}

Deno.test("typeInfo decorates value", () => {
  assertEquals(typeInfoOf(Person)?.properties, [{
    name: "name",
    type: "string",
    paramIndex: 0,
  }]);
});
