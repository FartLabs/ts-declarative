// deno-lint-ignore-file no-explicit-any

import type { DeclarativeStorage } from "./storage/storage.ts";

export interface DeclarativeOptions<
  TClass extends Class,
  TValue extends Record<string, any>,
> {
  storage: DeclarativeStorage<TValue>;
  prefix: string;
  target: TClass;
  initialize: () => TValue;
}

export function declareClass<
  TClass extends Class,
  TValue extends Record<string, any>,
>(
  { storage, prefix, target, initialize }: DeclarativeOptions<TClass, TValue>,
  ...fns: Declarative<TValue>[]
): TClass {
  if (target.name === undefined) {
    throw new Error("Class decorator must have a name.");
  }

  const id = `${prefix}${target.name}`;
  const fn = declarativeSequence<TValue>(...fns);
  const value = fn(storage.get(id, initialize)!, id, target.name);
  storage.set(id, value);

  // Associate the ID with its class.
  setClassID(target, id);

  // For classes, we need to return the constructor.
  return target;
}

export function declarativeSequence<TValue>(
  ...declaratives: Declarative<TValue>[]
): Declarative<TValue> {
  return (initialValue: TValue, id: string, name: string) => {
    return declaratives.reduce(
      (acc, fn) => fn(acc, id, name),
      structuredClone(initialValue),
    );
  };
}

export type Declarative<TValue> = (
  // TODO: data: {...
  value: TValue,
  id: string,
  name: string,
) => TValue;

export type Class = new (...args: any[]) => any;

/**
 * setClassID sets the ID of a class. This operation is O(1) as each class has one
 * unique ID. Assigning a single string property to the prototype of each class at
 * runtime is not more than O(1) per class.
 */
export function setClassID(value: Class, id: string): void {
  value.prototype[classID] = id;
}

/**
 * getClassID returns the ID of a class.
 */
export function getClassID(value: Class, suffix?: string): string | undefined {
  if (!Object.hasOwn(value.prototype, classID)) {
    return;
  }

  return value.prototype[classID] + (suffix ?? "");
}

export const classID = "~declarative";
