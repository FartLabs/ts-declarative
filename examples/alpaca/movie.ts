import { jsonld } from "#/lib/declarative/common/jsonld/jsonld.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/mod.ts";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/mod.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonld({ context: "https://schema.org/" })
@jsonSchema()
export class Movie {
  public constructor(public titleEIDR: string) {}
}

export const jsonSchemaString = JSON.stringify(
  getPrototypeValue<ValueJSONSchema>(Movie)?.jsonSchema ?? {},
);
