import { createDecoratorFactory } from "#/declarative/decorator.ts";
import { DeclarativeStorageInMemory } from "#/declarative/storage/in-memory.ts";
import { getClassID } from "#/declarative/declarative.ts";
import type { Context } from "../context/context.ts";
import { declarativeContext } from "../context/context.ts";

export interface State {
  context?: Context;
}

export const storage = new DeclarativeStorageInMemory<State>();
export const prefix = `${import.meta.url}#`;
export const context = createDecoratorFactory(
  {
    storage,
    prefix,
    initialize: (context?: Context): State => ({ context }),
  },
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
  console.log(classID, storage.get(classID!));
}
