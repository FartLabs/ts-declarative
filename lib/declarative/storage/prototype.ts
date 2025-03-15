import type { Class } from "#/lib/declarative/declarative.ts";
import { valueKey } from "#/lib/declarative/declarative.ts";
import type { DeclarativeStorage } from "./storage.ts";

/**
 * DeclarativeStoragePrototype is a declarative storage for classes, stored
 * on the class prototype.
 */
export class DeclarativeStoragePrototype<TClass extends Class, TValue>
  implements DeclarativeStorage<TValue> {
  public constructor(public target: TClass) {}

  public set(_id: string, value: TValue): void {
    this.target.prototype[valueKey] = value;
  }

  public get(_id: string, defaultValue?: () => TValue): TValue | undefined {
    return this.target.prototype[valueKey] ?? defaultValue?.();
  }
}

/**
 * fromPrototype returns the value stored on the class prototype.
 */
export function fromPrototype<TClass extends Class, TValue>(
  target: TClass,
): TValue | undefined {
  return target.prototype[valueKey];
}
