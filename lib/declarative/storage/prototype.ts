import type { Class } from "#/lib/declarative/declarative.ts";
import { valueKey } from "#/lib/declarative/declarative.ts";
import type { DeclarativeStorage } from "./storage.ts";

/**
 * DeclarativeStoragePrototype is a declarative storage for classes, stored
 * on the class prototype.
 */
export class DeclarativeStoragePrototype<TValue>
  implements DeclarativeStorage<TValue> {
  /**
   * constructor for DeclarativeStoragePrototype.
   */
  public constructor(public target: Class) {}

  /**
   * set the value on the class prototype.
   */
  public set(_id: string, value: TValue): void {
    this.target.prototype[valueKey] = value;
  }

  /**
   * get the value from the class prototype.
   */
  public get(_id: string, defaultValue?: () => TValue): TValue | undefined {
    return this.target.prototype[valueKey] ?? defaultValue?.();
  }
}
