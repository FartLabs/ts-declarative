import type { Class } from "#/lib/declarative/declarative.ts";
import {
  declareClass,
  getPrototypeID,
  getPrototypeValue,
} from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { Context, StateContext } from "#/examples/context/context.ts";
import type { StateTsMorph } from "#/examples/ts-morph/ts-morph.ts";
import { declarativeTsMorph } from "#/examples/ts-morph/ts-morph.ts";
import type { StateJSONSchema } from "#/examples/json-schema/json-schema.ts";
import { declarativeJSONSchema } from "#/examples/json-schema/json-schema.ts";

export interface State extends StateTsMorph, StateJSONSchema, StateContext {}

export async function createSetup(specifier: string) {
  const tsMorph = await declarativeTsMorph(new URL(specifier));
  const jsonSchema = declarativeJSONSchema();
  return {
    setup: <TClass extends Class>(target: TClass) => {
      return declareClass<TClass, State>(target, tsMorph, jsonSchema);
    },
  };
}

export const context = createDecoratorFactory({
  initialize: (context?: Context): StateContext => ({ context }),
});

@context({
  "@vocab": `${import.meta.url}#`,
})
export class Person {
  public constructor(public name: string) {}
}

if (import.meta.main) {
  console.log(
    getPrototypeID(Person),
    JSON.stringify(getPrototypeValue(Person), null, 2),
  );
  // Output:
  // Person {
  //   "context": {
  //     "@vocab": "file:///C:/Users/ethan/Documents/GitHub/ts-declarative/examples/getting-started/main.ts#"
  //   }
  // }

  const { setup } = await createSetup(import.meta.url);
  setup(Person);
  console.log(
    getPrototypeID(Person),
    JSON.stringify(getPrototypeValue(Person), null, 2),
  );
  // Output:
  // Person {
  //   "context": {
  //     "@vocab": "file:///C:/Users/ethan/Documents/GitHub/ts-declarative/examples/getting-started/main.ts#"
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
