import type { Class } from "#/lib/declarative/declarative.ts";
import { valueKey } from "#/lib/declarative/declarative.ts";
import type { DeclarativeStorage } from "./storage.ts";

/**
 * DeclarativeStoragePrototype is a declarative storage for classes, stored
 * on the class prototype.
 */
export class DeclarativeStoragePrototype<TValue>
  implements DeclarativeStorage<TValue> {
  public constructor(public target: Class) {}

  public set(_id: string, value: TValue): void {
    this.target.prototype[valueKey] = value;
  }

  public get(_id: string, defaultValue?: () => TValue): TValue | undefined {
    return this.target.prototype[valueKey] ?? defaultValue?.();
  }
}
