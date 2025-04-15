import { deepMerge } from "@std/collections/deep-merge";

/**
 * mergeValue deep merges the source value into the target value
 * recursively.
 */
// deno-lint-ignore no-explicit-any
export function mergeValue(target: any, source: any): any {
  return deepMerge(
    (target ?? {}) as Record<PropertyKey, unknown>,
    (source ?? {}) as Record<PropertyKey, unknown>,
  );
}
