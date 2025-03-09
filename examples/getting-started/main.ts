import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import { DeclarativeStorageInMemory } from "#/lib/declarative/storage/in-memory.ts";
import { getClassID } from "#/lib/declarative/declarative.ts";
import type { Context } from "#/examples/context/context.ts";
import { declarativeContext } from "#/examples/context/context.ts";
import type { DocNodeClass } from "#/examples/deno-doc/deno-doc.ts";
import { declarativeDenoDoc } from "#/examples/deno-doc/deno-doc.ts";

export interface State {
  context?: Context;
  denoDoc?: DocNodeClass;
}

export const storage = new DeclarativeStorageInMemory<State>();
export const prefix = `${import.meta.url}#`;
export const context = createDecoratorFactory(
  {
    storage,
    prefix,
    initialize: (context?: Context): State => ({ context }),
  },
  await declarativeDenoDoc(import.meta.url.toString(), {
    importMap: "./deno.json",
    includeAll: true,
  }),
  declarativeContext(prefix),
);

@context({
  name: "https://schema.org/name",
})
export class Person {
  public constructor(public name: string) {}
}

if (import.meta.main) {
  const classID = getClassID(Person);

  // deno -A examples/getting-started/main.ts
  console.log(classID, storage.get(classID!));
}
