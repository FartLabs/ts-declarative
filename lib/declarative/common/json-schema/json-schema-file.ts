import { Project } from "ts-morph";
import type { Class } from "#/lib/declarative/declarative.ts";
import { declarativeTsMorphProperties } from "#/lib/declarative/common/ts-morph/ts-morph.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { JSONSchemaMask } from "./json-schema.ts";
import { declarativeJSONSchema } from "./json-schema.ts";

/**
 * jsonSchemaDecoratorFactoryOfFile is a decorator factory for JSON Schema.
 */
export async function jsonSchemaDecoratorFactoryOfFile(
  specifier: string | URL,
  maskOrMaskFn1?: JSONSchemaMask,
): Promise<(maskOrMaskFn?: JSONSchemaMask) => (target: Class) => Class> {
  const project = new Project({ useInMemoryFileSystem: true });
  project.createSourceFile(
    specifier.toString(),
    await Deno.readTextFile(new URL(specifier)),
  );

  return createDecoratorFactory({
    initialize: (maskOrMaskFn0) => {
      const sourceFile = project.getSourceFileOrThrow(specifier.toString());
      return [
        declarativeTsMorphProperties(sourceFile),
        declarativeJSONSchema(maskOrMaskFn0 ?? maskOrMaskFn1),
      ];
    },
  });
}
