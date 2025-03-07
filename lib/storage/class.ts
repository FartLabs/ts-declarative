// deno-lint-ignore no-explicit-any
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
