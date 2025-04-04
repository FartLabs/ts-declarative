import type { OpenAPIServerStorage } from "./storage.ts";

export class MemoryOpenAPIServerStorage implements OpenAPIServerStorage {
  public constructor(
    // deno-lint-ignore no-explicit-any
    public storage: Map<string, any> = new Map<string, any>(),
  ) {}

  public get<T>(key: string): Promise<T | undefined> {
    return this.storage.get(key);
  }

  public set<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }

  public delete(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }

  public list<T>(): Promise<T[]> {
    return Promise.resolve(Array.from(this.storage.values()));
  }
}
