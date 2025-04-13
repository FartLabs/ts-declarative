import {
  standardCreate,
  standardDelete,
  standardGet,
  standardList,
  standardUpdate,
} from "./methods/mod.ts";
import type { StandardMethods } from "./standard-methods.ts";

/**
 * standardMethodsWithDenoKv is a decorator factory that creates a decorator
 * that adds Deno.Kv support to the standard Create, Delete, Get, List, and
 * Update operations of the resource for persistent storage.
 */
export function standardMethodsWithDenoKv(kv?: Deno.Kv): StandardMethods {
  return {
    create: (options) => standardCreate({ kv, ...options }),
    delete: (options) => standardDelete({ kv, ...options }),
    get: (options) => standardGet({ kv, ...options }),
    list: (options) => standardList({ kv, ...options }),
    update: (options) => standardUpdate({ kv, ...options }),
  };
}
