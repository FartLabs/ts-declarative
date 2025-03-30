import { Eta } from "@eta-dev/eta";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/mod.ts";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/mod.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonSchema({
  properties: {
    givenName: { title: "Given name" },
    familyName: { title: "Family name" },
  },
})
export class Person {
  public constructor(public givenName: string, public familyName: string) {}
}

const templateString = await Deno.readTextFile(
  new URL(import.meta.resolve("./index.eta.html")),
);
const eta = new Eta();

export async function renderTemplate(jsonSchemaString: string) {
  return await eta.renderStringAsync(templateString, { jsonSchemaString });
}

export const jsonSchemaPerson = getPrototypeValue<ValueJSONSchema>(Person)
  ?.jsonSchema;

if (import.meta.main) {
  Deno.serve(async () => {
    return new Response(
      await renderTemplate(JSON.stringify(jsonSchemaPerson)),
      {
        headers: { "content-type": "text/html" },
      },
    );
  });
}
