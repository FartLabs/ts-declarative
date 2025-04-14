import { assert } from "@std/assert/assert";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";
import { validate } from "./ajv.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

@autoSchema()
class Person {
  public constructor(public name: string) {}
}

Deno.test("validate validates a valid class instance", () => {
  const ash = new Person("Ash Ketchum");
  assert(validate(ash));
});
