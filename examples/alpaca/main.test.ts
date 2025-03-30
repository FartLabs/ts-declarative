import { assertSnapshot } from "@std/testing/snapshot";
import { Eta } from "@eta-dev/eta";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/mod.ts";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/mod.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonSchema()
export class Person {
  public constructor(public givenName: string, public familyName: string) {}
}

Deno.test("Generate Alpaca form from JSON Schema", async (t) => {
  const jsonSchemaPerson = getPrototypeValue<ValueJSONSchema>(Person)
    ?.jsonSchema;
  const tmpl = await Deno.readTextFile(
    new URL(import.meta.resolve("./index.eta.html")),
  );
  const eta = new Eta();
  const renderedHTML = await eta.renderStringAsync(tmpl, {
    jsonSchemaString: JSON.stringify(jsonSchemaPerson),
  });

  await assertSnapshot(t, renderedHTML);
});
