import type { Class } from "#/lib/declarative/declarative.ts";
import type { Registry } from "#/lib/declarative/registry/registry.ts";

export class MuxRegistry<T> implements Registry<T> {
  public constructor(public registries: Registry<T>[]) {}

  public register(target: Class, options?: T): void {
    for (const registry of this.registries) {
      registry.register(target, options);
    }
  }
}
