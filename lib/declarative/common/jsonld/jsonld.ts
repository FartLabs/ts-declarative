import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueType } from "./type.ts";
import { declarativeType } from "./type.ts";
import type { ValueContext } from "./context.ts";
import { declarativeContext } from "./context.ts";

/**
 * jsonldOf returns the JSON-LD of the class.
 */
export function jsonldOf<TClass extends Class>(
  target: TClass,
): ValueJSONLd | undefined {
  return getPrototypeValue<ValueJSONLd>(target);
}

/**
 * ValueJSONLd is the value for the JSON-LD decorator.
 */
export interface ValueJSONLd extends ValueType, ValueContext {}

/**
 * jsonld is the decorator for JSON-LD.
 * This is used to set the JSON-LD of the class.
 */
export const jsonld: (value: ValueJSONLd) => (target: Class) => Class =
  createDecoratorFactory({
    initialize: (value: ValueJSONLd): Declarative<ValueJSONLd>[] => {
      return [declarativeType(value?.type), declarativeContext(value?.context)];
    },
  });

/**
 * docOf returns the JSON-LD document of the instance.
 */
export function docOf<T>(instance: T): Record<string, unknown> {
  const { constructor } = instance as { constructor: Class };
  const value = getPrototypeValue<ValueJSONLd>(constructor);
  const doc: Record<string, unknown> = Object.assign({}, instance);
  if (value === undefined) {
    return doc;
  }

  if (value.context !== undefined) {
    Object.assign(doc, { "@context": value.context });
  }

  Object.assign(doc, { "@type": value.type ?? constructor.name });
  return doc;
}
