import { Eta } from "@eta-dev/eta";
import {
  jsonSchema,
  jsonSchemaOf,
} from "#/lib/declarative/common/json-schema/json-schema.ts";
import { createTypeInfoDecoratorFactoryAt } from "#/lib/declarative/common/type-info/type-info.ts";

const typeInfo = await createTypeInfoDecoratorFactoryAt(import.meta);

@jsonSchema()
@typeInfo()
class Person {
  public constructor(public givenName: string, public familyName: string) {}
}

const templateString = await Deno.readTextFile(
  new URL(import.meta.resolve("./index.eta.html")),
);
const eta = new Eta();

/**
 * renderTemplate renders the template with the given JSON Schema and Alpaca options.
 */
export async function renderTemplate(
  jsonSchemaString: string,
  alpacaOptions = "{}",
): Promise<string> {
  return await eta.renderStringAsync(templateString, {
    jsonSchemaString,
    optionsString: alpacaOptions,
  });
}

/**
 * jsonSchemaPerson is the JSON Schema of the Person class.
 */
// deno-lint-ignore no-explicit-any
export const jsonSchemaPerson: any = jsonSchemaOf(Person);

if (import.meta.main) {
  Deno.serve(async () => {
    return new Response(
      await renderTemplate(JSON.stringify(jsonSchemaPerson)),
      { headers: { "content-type": "text/html" } },
    );
  });
}
