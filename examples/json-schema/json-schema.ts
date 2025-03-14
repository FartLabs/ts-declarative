import { TypeBoxFromSyntax } from "@sinclair/typemap";
import type { Declarative } from "#/lib/declarative/declarative.ts";
import type { StateTsMorph } from "#/examples/ts-morph/ts-morph.ts";

export interface StateJSONSchema extends StateTsMorph {
  // deno-lint-ignore no-explicit-any
  jsonSchema?: any;
}

export function declarativeJSONSchema<
  TState extends StateJSONSchema,
>(): Declarative<TState> {
  return (state, _id, _name) => {
    return { ...state, jsonSchema: compile(state) };
  };
}

export function compile({ tsMorph }: StateTsMorph) {
  return TypeBoxFromSyntax({}, serialize({ tsMorph }));
}

export function serialize({ tsMorph }: StateTsMorph): string {
  if (tsMorph === undefined || tsMorph?.properties.length === 0) {
    return `{}`;
  }

  return `{ ${
    tsMorph.properties
      .map((property) => `"${property.name}": ${property.type}`)
      .join(", ")
  } }`;
}
