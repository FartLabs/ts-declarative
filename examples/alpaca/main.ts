import { Eta } from "@eta-dev/eta";
import {
  defaultJSONSchemaMask,
  jsonSchemaOf,
} from "#/lib/declarative/common/json-schema/json-schema.ts";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(
  import.meta.url,
  defaultJSONSchemaMask,
);

@jsonSchema()
export class Person {
  public constructor(public givenName: string, public familyName: string) {}
}

const templateString = await Deno.readTextFile(
  new URL(import.meta.resolve("./index.eta.html")),
);
const eta = new Eta();

export async function renderTemplate(
  jsonSchemaString: string,
  alpacaOptions = "{}",
) {
  return await eta.renderStringAsync(templateString, {
    jsonSchemaString,
    optionsString: alpacaOptions,
  });
}

export const jsonSchemaPerson = jsonSchemaOf(Person);

if (import.meta.main) {
  Deno.serve(async () => {
    return new Response(
      await renderTemplate(JSON.stringify(jsonSchemaPerson)),
      { headers: { "content-type": "text/html" } },
    );
  });
}
