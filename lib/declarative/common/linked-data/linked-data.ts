import type { Class } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { ValueType } from "./type.ts";
import type { ValueContext } from "./context.ts";

export interface ValueLinkedData extends ValueType, ValueContext {}

export function docOf<T>(instance: T): Record<string, unknown> {
  const { constructor } = instance as { constructor: Class };
  const value = getPrototypeValue<ValueLinkedData>(constructor);
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
