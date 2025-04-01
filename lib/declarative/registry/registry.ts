import type { Class } from "#/lib/declarative/declarative.ts";

/**
 * Registry manages the registration of declarative classes.
 */
export interface Registry<T = never> {
  register(target: Class, options?: T): void;
}
