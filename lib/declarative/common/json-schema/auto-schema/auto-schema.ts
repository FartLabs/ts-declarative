import { Project } from "ts-morph";
import type { Class } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import { declarativeTypeInfo } from "#/lib/declarative/common/type-info/type-info.ts";
import type { JSONSchemaMask } from "#/lib/declarative/common/json-schema/json-schema.ts";
import { declarativeJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";

/**
 * createAutoSchemaDecoratorFactory creates a decorator factory that decorates
 * a value with a JSON Schema and automatically reads the type information
 * from the class.
 */
export async function createAutoSchemaDecoratorFactoryAt(
  { url }: ImportMeta,
): Promise<(mask?: JSONSchemaMask) => (target: Class) => Class> {
  const project = new Project({ useInMemoryFileSystem: true });
  const specifier = new URL(url);
  project.createSourceFile(
    specifier.toString(),
    await Deno.readTextFile(specifier),
  );

  return createDecoratorFactory({
    initialize: (mask?: JSONSchemaMask) => {
      return [
        declarativeTypeInfo(project, specifier),
        declarativeJSONSchema(mask),
      ];
    },
  });
}
