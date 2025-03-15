// deno-lint-ignore-file no-explicit-any

import type { DeclarativeStorage } from "./storage/storage.ts";
import { DeclarativeStoragePrototype } from "./storage/prototype.ts";

export interface DeclarativeOptions<TClass extends Class, TValue> {
  prefix: string;
  target: TClass;
  initialize: () => TValue;
  storage?: DeclarativeStorage<TValue>;
}

export function declareClass<TClass extends Class, TValue>(
  {
    prefix,
    target,
    initialize,
    storage = new DeclarativeStoragePrototype(target),
  }: DeclarativeOptions<TClass, TValue>,
  ...fns: Declarative<TValue>[]
): TClass {
  if (target.name === undefined) {
    throw new Error("Class decorator must have a name.");
  }

  const id = `${prefix}${target.name}`;
  const fn = declarativeSequence<TValue>(...fns);
  const value = fn(storage.get(id, initialize)!, target.name);
  storage.set(id, value);

  // Associate the ID with its class.
  setClassID(target, id);

  // For classes, we need to return the constructor.
  return target;
}

export function declarativeSequence<TValue>(
  ...declaratives: Declarative<TValue>[]
): Declarative<TValue> {
  return (initialValue: TValue, name: string) => {
    return declaratives.reduce(
      (acc, fn) => fn(acc, name),
      structuredClone(initialValue),
    );
  };
}

export type Declarative<TValue> = (value: TValue, name: string) => TValue;

export type Class = new (...args: any[]) => any;

/**
 * setClassID sets the ID of a class. This operation is O(1) as each class has one
 * unique ID. Assigning a single string property to the prototype of each class at
 * runtime is not more than O(1) per class.
 */
export function setClassID(value: Class, id: string): void {
  value.prototype[idKey] = id;
}

/**
 * getClassID returns the ID of a class.
 */
export function getClassID(value: Class, suffix?: string): string | undefined {
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
 * setBaseValue sets the base value of a class.
 */
export function setBaseValue<TClass extends Class, TValue>(
  target: TClass,
  value: TValue,
): void {
  target.prototype[valueKey] = value;
}

/**
 * getBaseValue returns the base value of a class.
 */
export function getBaseValue<TClass extends Class, TValue>(
  target: TClass,
  defaultValue?: () => TValue,
): TValue | undefined {
  return target.prototype[valueKey] ?? defaultValue?.();
}

/**
 * valueKey is the property name applied to the class prototype to store the
 * base value.
 */
export const valueKey = "~value";
