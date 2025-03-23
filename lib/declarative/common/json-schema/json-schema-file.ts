import { Project } from "ts-morph";
import type { Class } from "#/lib/declarative/declarative.ts";
import { declarativeTsMorph } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import { declarativeJSONSchema } from "./json-schema.ts";

export async function jsonSchemaDecoratorFactoryOfFile(
  specifier: string | URL,
): Promise<() => (target: Class) => Class> {
  const project = new Project({ useInMemoryFileSystem: true });
  project.createSourceFile(
    specifier.toString(),
    await Deno.readTextFile(new URL(specifier)),
  );

  return createDecoratorFactory({
    initialize: () => {
      const sourceFile = project.getSourceFileOrThrow(specifier.toString());
      return [declarativeTsMorph(sourceFile), declarativeJSONSchema()];
    },
  });
}
