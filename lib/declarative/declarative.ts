// deno-lint-ignore-file no-explicit-any

import type { DeclarativeStorage } from "./storage/storage.ts";
import { DeclarativeStoragePrototype } from "./storage/prototype.ts";

export interface DeclarativeOptions<TClass extends Class, TValue> {
  target: TClass;
  prefix?: string;
  storage?: DeclarativeStorage<TValue>;
  defaultValue?: () => TValue;
}

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

export function getOptions<TClass extends Class, TValue>(
  optionsOrClass: TClass | DeclarativeOptions<TClass, TValue>,
): DeclarativeOptions<TClass, TValue> {
  const options = typeof optionsOrClass === "object"
    ? optionsOrClass
    : { target: optionsOrClass };
  options.storage ??= new DeclarativeStoragePrototype(options.target);
  return options;
}

export function declarativeSequence<TValue>(
  ...declaratives: Declarative<TValue>[]
): Declarative<TValue> {
  return (initialValue: TValue | undefined, name: string) => {
    return declaratives.reduce(
      (acc, fn) => fn(acc, name),
      structuredClone(initialValue),
    );
  };
}

export type Declarative<TValue> = (
  value: TValue | undefined,
  name: string,
) => TValue | undefined;

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
