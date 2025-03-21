import type { Class } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import type { StateType } from "./type.ts";
import type { StateContext } from "./context.ts";

export interface StateLinkedData extends StateType, StateContext {}

export function docOf<T>(instance: T): Record<string, unknown> {
  const { constructor } = instance as { constructor: Class };
  const state = getPrototypeValue<StateLinkedData>(constructor);
  const doc: Record<string, unknown> = Object.assign({}, instance);
  if (state === undefined) {
    return doc;
  }

  if (state.context !== undefined) {
    Object.assign(doc, { "@context": state.context });
  }

  Object.assign(doc, { "@type": state.type ?? constructor.name });
  return doc;
}
