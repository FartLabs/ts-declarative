import type { Class } from "#/lib/declarative/declarative.ts";
import type { DeclarativeStorage } from "./storage.ts";

/**
 * DeclarativeStoragePrototype is a declarative storage for classes, stored
 * on the class prototype.
 */
export class DeclarativeStoragePrototype<TClass extends Class, TValue>
  implements DeclarativeStorage<TValue>
{
  public constructor(public target: TClass) {}

  public set(id: string, value: TValue): void {
    this.target.prototype[id] = value;
  }

  public get(id: string, defaultValue?: () => TValue): TValue | undefined {
    return this.target.prototype[id] ?? defaultValue?.();
  }
}
