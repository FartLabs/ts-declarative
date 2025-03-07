import type { DeclarativeStorage } from "./storage.ts";

export class DeclarativeStorageInMemory<T> implements DeclarativeStorage<T> {
  public constructor(public data: Map<string, T> = new Map()) {}

  public set(id: string, value: T): void {
    this.data.set(id, value);
  }

  public get(id: string, defaultValue?: () => T): T {
    const value = (id !== undefined ? this.data.get(id) : undefined) ??
      defaultValue?.();
    if (value === undefined) {
      throw new Error(`Annotation ${id} not found`);
    }

    return value;
  }
}
