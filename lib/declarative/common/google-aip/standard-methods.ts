import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { OperationOptions } from "#/lib/declarative/common/google-aip/operation.ts";
import type { StandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/standard-method-store.ts";
import type {
  StandardCreateOptions,
  StandardDeleteOptions,
  StandardGetOptions,
  StandardListOptions,
  StandardUpdateOptions,
} from "./standard-methods/mod.ts";
import {
  initializeStandardCreate,
  initializeStandardDelete,
  initializeStandardGet,
  initializeStandardList,
  initializeStandardUpdate,
  standardCreate,
  standardDelete,
  standardGet,
  standardList,
  standardUpdate,
} from "./standard-methods/mod.ts";

export * from "./standard-methods/mod.ts";

/**
 * createStandardMethodDecoratorFactory is a decorator factory that creates
 * a decorator with an individual standard method.
 *
 * @see https://google.aip.dev/130
 */
export function createStandardMethodDecoratorFactory(
  store: StandardMethodStore,
): StandardMethods {
  return {
    create: (options) => standardCreate({ store, ...options }),
    delete: (options) => standardDelete({ store, ...options }),
    get: (options) => standardGet({ store, ...options }),
    list: (options) => standardList({ store, ...options }),
    update: (options) => standardUpdate({ store, ...options }),
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
  store: StandardMethodStore,
  prefix: string[] = [],
): (options?: StandardMethodsOptions | undefined) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize(options?: StandardMethodsOptions) {
      return [
        ...initializeStandardMethod(
          options,
          store,
          prefix,
          initializeStandardCreate,
          "create",
        ),
        ...initializeStandardMethod(
          options,
          store,
          prefix,
          initializeStandardDelete,
          "delete",
        ),
        ...initializeStandardMethod(
          options,
          store,
          prefix,
          initializeStandardGet,
          "get",
        ),
        ...initializeStandardMethod(
          options,
          store,
          prefix,
          initializeStandardList,
          "list",
        ),
        ...initializeStandardMethod(
          options,
          store,
          prefix,
          initializeStandardUpdate,
          "update",
        ),
      ];
    },
  });
}

function initializeStandardMethod<T>(
  options: StandardMethodsOptions | undefined,
  store: StandardMethodStore,
  prefix: string[],
  // deno-lint-ignore no-explicit-any
  initialize: (options?: T) => Array<Declarative<any>>,
  method: keyof StandardMethods,
) {
  const { parent, resourceName, collectionIdentifier, standardMethods } =
    options ?? {};
  return standardMethods?.[method] ?? true
    ? initialize({
      store,
      prefix,
      parent,
      resourceName,
      collectionIdentifier,
      ...((typeof standardMethods?.[method] === "object"
        ? standardMethods[method]
        : {}) as T),
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
