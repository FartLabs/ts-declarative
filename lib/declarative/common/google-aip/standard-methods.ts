import type { Class } from "#/lib/declarative/declarative.ts";
import type {
  standardCreate,
  standardDelete,
  standardGet,
  standardList,
  standardUpdate,
} from "./methods/mod.ts";

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
  get: (
    ...args: Parameters<typeof standardGet>
  ) => (target: Class) => Class;

  /**
   * List resources using the standard List method.
   */
  list: (
    ...args: Parameters<typeof standardList>
  ) => (target: Class) => Class;

  /**
   * Update a resource using the standard Update method.
   */
  update: (
    ...args: Parameters<typeof standardUpdate>
  ) => (target: Class) => Class;
}
