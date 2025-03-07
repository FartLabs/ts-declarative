// deno-lint-ignore-file no-explicit-any

import { DeclarativeStorage } from "./storage/storage.ts";

export function declareClass<
  TClass extends Class,
  TValue extends Record<string, any>,
>(
  { storage, prefix }: DeclarativeOptions<TValue>,
  target: TClass,
  initialize: () => TValue,
  ...fns: Declarative<TValue>[]
) {
  if (target.name === undefined) {
    throw new Error("Class decorator must have a name.");
  }

  const id = `${prefix}${target.name}`;
  const declarativeMux = declarativeSequence<TValue>(...fns);
  const value = declarativeMux(storage.get(id, initialize)!, id, target.name);
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

export interface DeclarativeOptions<TValue> {
  storage: DeclarativeStorage<TValue>;
  prefix: string; // TODO: Refactor prefix to file path.
}

export type Declarative<TValue> = (
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
