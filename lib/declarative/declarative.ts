// deno-lint-ignore-file no-explicit-any

import type { DeclarativeStorage } from "./storage/storage.ts";
import { DeclarativeStoragePrototype } from "./storage/prototype.ts";

/**
 * DeclarativeOptions is the options for the declarative function.
 */
export interface DeclarativeOptions<TClass extends Class, TValue> {
  /**
   * target is the class to apply the declarative function to.
   */
  target: TClass;

  /**
   * prefix is the prefix to use for the ID.
   */
  prefix?: string;

  /**
   * storage is the declarative storage for the class.
   */
  storage?: DeclarativeStorage<TValue>;

  /**
   * defaultValue is a function that returns the default value for the
   * declarative function.
   */
  defaultValue?: () => TValue;
}

/**
 * declareClass applies a declarative function to a class.
 */
export function declareClass<TClass extends Class, TValue>(
  optionsOrClass: TClass | DeclarativeOptions<TClass, TValue>,
  ...fns: Declarative<TValue>[]
): TClass {
  const { target, prefix, defaultValue, storage } = getOptions(optionsOrClass);
  if (target.name === undefined) {
    throw new Error("Class decorator must have a name.");
  }

  if (storage === undefined) {
    throw new Error("Class decorator must have a storage.");
  }

  const id = `${prefix ?? ""}${target.name}`;
  const fn = declarativeSequence<TValue>(...fns);
  const value = fn(storage.get(id, defaultValue), target.name);
  if (value !== undefined) {
    storage.set(id, value);
  }

  // Associate the ID with its class.
  setPrototypeID(target, id);

  // For classes, we need to return the constructor.
  return target;
}

/**
 * getOptions returns the options for the class decorator.
 */
export function getOptions<TClass extends Class, TValue>(
  optionsOrClass: TClass | DeclarativeOptions<TClass, TValue>,
): DeclarativeOptions<TClass, TValue> {
  const options = typeof optionsOrClass === "object"
    ? optionsOrClass
    : { target: optionsOrClass };
  options.storage ??= new DeclarativeStoragePrototype(options.target);
  return options;
}

/**
 * declarativeSequence returns a declarative function that applies a sequence of
 * declaratives.
 */
export function declarativeSequence<TValue>(
  ...declaratives: Declarative<TValue>[]
): Declarative<TValue> {
  return (initialValue: TValue | undefined, name: string) => {
    return declaratives.reduce(
      (acc, fn) => fn(acc, name),
      initialValue,
    );
  };
}

/**
 * Declarative is a type that represents a declarative function.
 * It takes a value and a of the class name and returns a value.
 */
export type Declarative<TValue> = (
  value: TValue | undefined,
  name: string,
) => TValue | undefined;

/**
 * Class is a type that represents a runtime class.
 */
export type Class = new (...args: any[]) => any;

/**
 * setPrototypeID associates an ID with the prototype of a class.
 */
export function setPrototypeID(value: Class, id: string): void {
  value.prototype[idKey] = id;
}

/**
 * getPrototypeID returns the ID associated with the prototype of a class.
 */
export function getPrototypeID(
  value: Class,
  suffix?: string,
): string | undefined {
  if (!Object.hasOwn(value.prototype, idKey)) {
    return;
  }

  return value.prototype[idKey] + (suffix ?? "");
}

/**
 * idKey is the property name applied to the class prototype to store its ID.
 */
export const idKey = "~id";

/**
 * setPrototypeValue associates a value with the prototype of a class.
 */
export function setPrototypeValue<TValue>(target: Class, value: TValue): void {
  target.prototype[valueKey] = value;
}

/**
 * getPrototypeValue returns the value associated with the prototype of a
 * class.
 */
export function getPrototypeValue<TValue>(
  target: Class,
  defaultValue?: () => TValue,
): TValue | undefined {
  return target.prototype[valueKey] ?? defaultValue?.();
}

/**
 * valueKey is the property name applied to the class prototype to store the
 * base value.
 */
export const valueKey = "~value";
