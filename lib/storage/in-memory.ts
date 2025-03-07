import type { DeclarativeStorage } from "./storage.ts";
// import { getClassID } from "./declarative-storage.ts";

export class DeclarativeStorageInMemory<T> implements DeclarativeStorage<T> {
  public constructor(public storage: Map<string, T> = new Map()) {}

  public set(id: string, value: T): void {
    this.storage.set(id, value);
  }

  public get(id: string, defaultValue?: () => T): T {
    const value = (id !== undefined ? this.storage.get(id) : undefined) ??
      defaultValue?.();
    if (value === undefined) {
      throw new Error(`Annotation ${id} not found`);
    }

    return value;
  }
}
