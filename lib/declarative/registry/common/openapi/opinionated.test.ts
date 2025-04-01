import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";
import { OpenAPISpecification } from "#/lib/declarative/registry/common/openapi/specification.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonSchema()
class Example {
  public constructor(public name: string) {}
}

Deno.test("OpenAPISpecification registers class", () => {
  const spec = new OpenAPISpecification();
  spec.register(Example);
  console.log(spec.specification);
});
