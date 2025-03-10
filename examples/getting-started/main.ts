import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import { DeclarativeStorageInMemory } from "#/lib/declarative/storage/in-memory.ts";
import { getClassID } from "#/lib/declarative/declarative.ts";
import type { Context, StateContext } from "#/examples/context/context.ts";
import { declarativeContext } from "#/examples/context/context.ts";
import type { StateDenoDoc } from "#/examples/deno-doc/deno-doc.ts";
import { declarativeDenoDoc } from "#/examples/deno-doc/deno-doc.ts";
import type { StateTsMorph } from "#/examples/ts-morph/ts-morph.ts";
import { declarativeTsMorph } from "#/examples/ts-morph/ts-morph.ts";

export interface State extends StateContext, StateDenoDoc, StateTsMorph {}

export const storage = new DeclarativeStorageInMemory<State>();
export const prefix = `${import.meta.url}#`;
export const context = createDecoratorFactory(
  {
    storage,
    prefix,
    initialize: (context?: Context): State => ({ context }),
  },
  await declarativeDenoDoc(import.meta.url, {
    importMap: new URL("../../deno.json", import.meta.url).toString(),
    includeAll: true,
  }),
  await declarativeTsMorph(new URL(import.meta.url)),
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

  // file:///C:/Users/ethan/Documents/GitHub/ts-declarative/examples/getting-started/main.ts#Person {
  //   context: {
  //     "@vocab": "file:///C:/Users/ethan/Documents/GitHub/ts-declarative/examples/getting-started/main.ts#",
  //     name: "https://schema.org/name"
  //   },
  //   denoDoc: {
  //     name: "Person",
  //     isDefault: false,
  //     location: {
  //       filename: "file:///C:/Users/ethan/Documents/GitHub/ts-declarative/examples/getting-started/main.ts",
  //       line: 32,
  //       col: 0,
  //       byteIndex: 1253
  //     },
  //     ...
  //   },
  //   tsMorph: {
  //     decorators: [
  //       {
  //         kind: 7,
  //         name: "context",
  //         arguments: [ '{\n  name: "https://schema.org/name",\n}' ],
  //         typeArguments: []
  //       }
  //     ],
  //     typeParameters: [],
  //     docs: [],
  //     isAbstract: false,
  //     implements: [],
  //     name: "Person",
  //     isExported: true,
  //     isDefaultExport: false,
  //     hasDeclareKeyword: false,
  //     kind: 2,
  //     ctors: [
  //       {
  //         statements: [],
  //         parameters: [ [Object] ],
  //         returnType: undefined,
  //         typeParameters: [],
  //         docs: [],
  //         scope: "public",
  //         kind: 5,
  //         overloads: []
  //       }
  //     ],
  //     staticBlocks: [],
  //     methods: [],
  //     properties: [],
  //     extends: undefined,
  //     getAccessors: [],
  //     setAccessors: []
  //   }
  // }
}
