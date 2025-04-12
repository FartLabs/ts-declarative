import type { Class } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import {
  createProjectAt,
  declarativeTypeInfo,
} from "#/lib/declarative/common/type-info/type-info.ts";
import type { JSONSchemaMask } from "#/lib/declarative/common/json-schema/json-schema.ts";
import { declarativeJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";

/**
 * createAutoSchemaDecoratorFactory creates a decorator factory that decorates
 * a value with a JSON Schema and automatically reads the type information
 * from the class.
 *
 * @example
 * ```ts
 * const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);
 *
 * @autoSchema()
 * class Person {
 *   public constructor(public name: string) {}
 * }
 *
 * const personSchema = jsonSchemaOf(Person);
 * ```
 */
export async function createAutoSchemaDecoratorFactoryAt(
  { url }: ImportMeta,
): Promise<(mask?: JSONSchemaMask) => (target: Class) => Class> {
  const specifier = new URL(url);
  const project = await createProjectAt(specifier);
  return createDecoratorFactory({
    initialize: (mask?: JSONSchemaMask) => {
      return [
        declarativeTypeInfo(project, specifier),
        declarativeJSONSchema(mask),
      ];
    },
  });
}
