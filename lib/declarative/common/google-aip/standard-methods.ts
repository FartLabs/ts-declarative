import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type {
  standardCreate,
  StandardCreateOptions,
  standardDelete,
  StandardDeleteOptions,
  standardGet,
  StandardGetOptions,
  standardList,
  StandardListOptions,
  standardUpdate,
  StandardUpdateOptions,
} from "./methods/mod.ts";
import { initializeStandardCreate } from "#/lib/declarative/common/google-aip/mod.ts";

/**
 * standardMethods is a decorator factory that creates a decorator
 * that adds the desired standard methods to the resource.
 */
export function standardMethods(options?: {
  create?: StandardCreateOptions | boolean;
  delete?: StandardDeleteOptions | boolean;
  get?: StandardGetOptions | boolean;
  list?: StandardListOptions | boolean;
  update?: StandardUpdateOptions | boolean;
}): () => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: () => [
      ...initializeStandardMethod(initializeStandardCreate, options?.create),
      // TODO: initialize all standard methods.
    ],
  });
}

function initializeStandardMethod<T>(
  // deno-lint-ignore no-explicit-any
  initialize: (options?: T) => Array<Declarative<any>>,
  options?: T | boolean | undefined,
) {
  return options
    ? initialize(typeof options !== "boolean" ? options : undefined)
    : [];
}

/**
 * StandardMethods are the standard methods of a resource-oriented API.
 */
export interface StandardMethods {
  /**
   * create decorates with the standard Create method.
   */
  create: (
    ...args: Parameters<typeof standardCreate>
  ) => (target: Class) => Class;

  /**
   * delete decorates with the standard Delete method.
   */
  delete: (
    ...args: Parameters<typeof standardDelete>
  ) => (target: Class) => Class;

  /**
   * Get a resource using the standard Get method.
   */
  get: (...args: Parameters<typeof standardGet>) => (target: Class) => Class;

  /**
   * List resources using the standard List method.
   */
  list: (...args: Parameters<typeof standardList>) => (target: Class) => Class;

  /**
   * Update a resource using the standard Update method.
   */
  update: (
    ...args: Parameters<typeof standardUpdate>
  ) => (target: Class) => Class;
}
