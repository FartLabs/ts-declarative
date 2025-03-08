// deno-lint-ignore-file no-explicit-any

import { createDecoratorFactory } from "#/declarative/decorator.ts";
import { DeclarativeStorageInMemory } from "#/declarative/storage/in-memory.ts";
import { getClassID } from "#/declarative/declarative.ts";

interface State {
  context?: Context;
}

type Context = Record<string, any>;

const storage = new DeclarativeStorageInMemory<State>();
const declarative = createDecoratorFactory(
  {
    storage,
    prefix: "example#",
    initialize: (context?: Context): State => ({ context }),
  },
  (state, _id, _name) => {
    return {
      ...state,
      context: { ...state.context, "@vocab": "example#" },
    };
  },
);

@declarative({
  name: "https://schema.org/Person",
})
class Person {
  public constructor(public name: string) {}
}

const classID = getClassID(Person);
console.log(classID, storage.get(classID!));
