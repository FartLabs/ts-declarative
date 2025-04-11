import type { DeclarativeStorage } from "./storage.ts";

/**
 * DeclarativeStorageInMemory is a declarative storage for classes, stored
 * in memory.
 */
export class DeclarativeStorageInMemory<T> implements DeclarativeStorage<T> {
  /**
   * constructor for DeclarativeStorageInMemory.
   */
  public constructor(public data: Map<string, T> = new Map()) {}

  /**
   * set the value on the storage.
   */
  public set(id: string, value: T): void {
    this.data.set(id, value);
  }

  /**
   * get the value from the storage.
   */
  public get(id: string, defaultValue?: () => T): T | undefined {
    return (
      (id !== undefined ? this.data.get(id) : undefined) ?? defaultValue?.()
    );
  }
}
