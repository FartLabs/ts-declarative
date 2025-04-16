import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import {
  createProjectAt,
  declarativeTypeInfo,
} from "#/lib/declarative/common/type-info/type-info.ts";
import type {
  JSONSchemaMask,
  ValueJSONSchema,
} from "#/lib/declarative/common/json-schema/json-schema.ts";
import { declarativeJSONSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";

/**
 * createAutoSchemaDecoratorFactoryAt creates a decorator factory that
 * decorates a value with a JSON Schema and automatically reads the type
 * information from the class.
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
  meta: ImportMeta,
): // deno-lint-ignore no-explicit-any
Promise<(mask?: any) => (target: Class) => Class> {
  return createDecoratorFactory({
    initialize: await initializeAutoSchema(meta),
  });
}

/**
 * initializeAutoSchema creates the declaratives to add JSON Schema to a value
 * and automatically read the type information from the class.
 */
export async function initializeAutoSchema({
  url,
}: ImportMeta): Promise<
  (mask?: JSONSchemaMask) => Array<Declarative<ValueJSONSchema>>
> {
  const specifier = new URL(url);
  const project = await createProjectAt(specifier);
  return (mask?: JSONSchemaMask) => {
    return [
      declarativeTypeInfo(project, specifier),
      declarativeJSONSchema(mask),
    ];
  };
}
