import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
import type { StandardCreateOptions } from "./standard-create/standard-create.ts";
import {
  initializeStandardCreate,
  standardCreate,
} from "./standard-create/standard-create.ts";
import type { StandardDeleteOptions } from "./standard-delete/standard-delete.ts";
import {
  initializeStandardDelete,
  standardDelete,
} from "./standard-delete/standard-delete.ts";
import type { StandardGetOptions } from "./standard-get/standard-get.ts";
import {
  initializeStandardGet,
  standardGet,
} from "./standard-get/standard-get.ts";
import type { StandardListOptions } from "./standard-list/standard-list.ts";
import {
  initializeStandardList,
  standardList,
} from "./standard-list/standard-list.ts";
import type { StandardUpdateOptions } from "./standard-update/standard-update.ts";
import {
  initializeStandardUpdate,
  standardUpdate,
} from "./standard-update/standard-update.ts";

export * from "./standard-create/mod.ts";
export * from "./standard-delete/mod.ts";
export * from "./standard-get/mod.ts";
export * from "./standard-list/mod.ts";
export * from "./standard-update/mod.ts";

/**
 * createStandardMethodDecoratorFactory is a decorator factory that creates
 * a decorator with an individual standard method.
 *
 * @see https://google.aip.dev/130
 */
export function createStandardMethodDecoratorFactory(
  kv: Deno.Kv,
): StandardMethods {
  return {
    create: (options) => standardCreate({ kv, ...options }),
    delete: (options) => standardDelete({ kv, ...options }),
    get: (options) => standardGet({ kv, ...options }),
    list: (options) => standardList({ kv, ...options }),
    update: (options) => standardUpdate({ kv, ...options }),
  };
}

/**
 * createStandardMethodsDecoratorFactory is a decorator factory that creates
 * a decorator that adds the desired Google AIP standard methods to the
 * resource.
 *
 * @see https://google.aip.dev/130
 */
export function createStandardMethodsDecoratorFactory(
  kv: Deno.Kv,
): (options?: StandardMethodsOptions | undefined) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize(options?: StandardMethodsOptions) {
      return [
        ...initializeStandardMethod(
          options,
          kv,
          initializeStandardCreate,
          "create",
        ),
        ...initializeStandardMethod(
          options,
          kv,
          initializeStandardDelete,
          "delete",
        ),
        ...initializeStandardMethod(options, kv, initializeStandardGet, "get"),
        ...initializeStandardMethod(
          options,
          kv,
          initializeStandardList,
          "list",
        ),
        ...initializeStandardMethod(
          options,
          kv,
          initializeStandardUpdate,
          "update",
        ),
      ];
    },
  });
}

function initializeStandardMethod<T>(
  options: StandardMethodsOptions | undefined,
  kv: Deno.Kv,
  // deno-lint-ignore no-explicit-any
  initialize: (options?: T) => Array<Declarative<any>>,
  method: keyof StandardMethods,
) {
  const {
    parent,
    resourceName,
    collectionIdentifier,
    standardMethods = {
      create: true,
      delete: true,
      get: true,
      list: true,
      update: true,
    },
  } = options ?? {};
  return standardMethods?.[method]
    ? initialize({
      kv,
      parent,
      resourceName,
      collectionIdentifier,
      ...((standardMethods[method] ?? {}) as T),
    })
    : [];
}

/**
 * StandardMethodsOptions is the options for the standard methods of the
 * resource.
 */
export interface StandardMethodsOptions extends
  Pick<
    OperationOptions,
    "parent" | "resourceName" | "collectionIdentifier"
  > {
  /**
   * standardMethods are the options for the standard methods of the resource.
   */
  standardMethods?: {
    /**
     * create is the options for the standard Create method of the resource.
     */
    create?: StandardCreateOptions | boolean;

    /**
     * delete is the options for the standard Delete method of the resource.
     */
    delete?: StandardDeleteOptions | boolean;

    /**
     * get is the options for the standard Get method of the resource.
     */
    get?: StandardGetOptions | boolean;

    /**
     * list is the options for the standard List method of the resource.
     */
    list?: StandardListOptions | boolean;

    /**
     * update is the options for the standard Update method of the resource.
     */
    update?: StandardUpdateOptions | boolean;
  };
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
