import { jsonld } from "#/lib/declarative/common/jsonld/jsonld.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/mod.ts";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/mod.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonld({
  context: {
    "@vocab": "https://schema.org/",
    label: "http://www.w3.org/2000/01/rdf-schema#label",
  },
})
@jsonSchema()
export class Movie {
  public constructor(public label: string) {}
}

export const jsonSchemaMovie = getPrototypeValue<ValueJSONSchema>(Movie)
  ?.jsonSchema;
