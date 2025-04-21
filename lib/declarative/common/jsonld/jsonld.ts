import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueContext } from "./context.ts";
import { declarativeContext } from "./context.ts";
import type { ValueType } from "./type.ts";
import { declarativeType } from "./type.ts";

export * from "./context.ts";
export * from "./type.ts";

/**
 * ValueJSONLd is the value for the JSON-LD decorator.
 */
export interface ValueJSONLd extends ValueType, ValueContext {}

/**
 * jsonld is the decorator for JSON-LD.
 * This is used to set the JSON-LD of the class.
 */
export const jsonld: (value: ValueJSONLd) => (target: Class) => Class =
  createDecoratorFactory({ initialize: initializeJSONLd });

/**
 * initializeJSONLd is the initializer for the JSON-LD decorator.
 */
export function initializeJSONLd(
  value: ValueJSONLd,
): Declarative<ValueJSONLd>[] {
  return [declarativeType(value?.type), declarativeContext(value?.context)];
}

/**
 * docOf returns the JSON-LD document of the instance.
 */
export function docOf(instance: InstanceType<Class>): Record<string, unknown> {
  return docOfObject(instance.constructor, instance);
}

/**
 * docOfObject returns the JSON-LD document of the object.
 */
export function docOfObject(
  target: Class,
  instance: InstanceType<Class>,
): Record<string, unknown> {
  const value = jsonldOf(target);
  const doc: Record<string, unknown> = Object.assign({}, instance);
  if (value === undefined) {
    return doc;
  }

  if (value.context !== undefined) {
    Object.assign(doc, { "@context": value.context });
  }

  Object.assign(doc, { "@type": value.type ?? target.name });
  return doc;
}

/**
 * jsonldOf returns the JSON-LD of the class.
 */
export function jsonldOf<TClass extends Class>(
  target: TClass,
): ValueJSONLd | undefined {
  return getPrototypeValue<ValueJSONLd>(target);
}
