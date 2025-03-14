import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import { DeclarativeStorageInMemory } from "#/lib/declarative/storage/in-memory.ts";
import { getClassID } from "#/lib/declarative/declarative.ts";
import type { Context, StateContext } from "#/examples/context/context.ts";
import { declarativeContext } from "#/examples/context/context.ts";
import type { StateTsMorph } from "#/examples/ts-morph/ts-morph.ts";
import { declarativeTsMorph } from "#/examples/ts-morph/ts-morph.ts";
import type { StateJSONSchema } from "#/examples/json-schema/json-schema.ts";
import { declarativeJSONSchema } from "#/examples/json-schema/json-schema.ts";

export interface State extends StateContext, StateTsMorph, StateJSONSchema {}

export const storage = new DeclarativeStorageInMemory<State>();
export const prefix = `${import.meta.url}#`;
export const context = createDecoratorFactory(
  {
    storage,
    prefix,
    initialize: (context?: Context): State => ({ context }),
  },
  await declarativeTsMorph(new URL(import.meta.url)),
  declarativeJSONSchema(),
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
  console.log(classID, JSON.stringify(storage.get(classID!), null, 2));
  // Output:
  // file:///C:/Users/ethan/Documents/GitHub/ts-declarative/examples/getting-started/main.ts#Person {
  //   "context": {
  //     "@vocab": "file:///C:/Users/ethan/Documents/GitHub/ts-declarative/examples/getting-started/main.ts#",
  //     "name": "https://schema.org/name"
  //   },
  //   "tsMorph": {
  //     "properties": [
  //       {
  //         "name": "name",
  //         "type": "string",
  //         "paramIndex": 0
  //       }
  //     ]
  //   },
  //   "jsonSchema": {
  //     "type": "object",
  //     "properties": {
  //       "name": {
  //         "type": "string"
  //       }
  //     },
  //     "required": [
  //       "name"
  //     ]
  //   }
  // }
}
