import { jsonld } from "#/lib/declarative/common/jsonld/jsonld.ts";
import type { ValueJSONSchema } from "#/lib/declarative/common/json-schema/mod.ts";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/mod.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonld({
  context: "https://www.w3.org/2002/12/cal/ical#",
  type: "Vtodo",
})
@jsonSchema()
export class Todo {
  public constructor(
    public uid: string,
    public summary: string, // TODO: Add status property to tell if the todo is done or not.
  ) {}
}

export const jsonSchemaTodo = getPrototypeValue<ValueJSONSchema>(Todo)
  ?.jsonSchema;
