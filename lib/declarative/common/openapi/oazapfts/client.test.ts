import { assertSnapshot } from "@std/testing/snapshot";
import { Project } from "ts-morph";
import { createTypeInfoDecoratorFactory } from "#/lib/declarative/common/type-info/type-info.ts";
import { jsonSchema } from "#/lib/declarative/common/json-schema/json-schema.ts";
import { openapi } from "#/lib/declarative/common/openapi/openapi.ts";
import {
  standardCreate,
  standardGet,
} from "#/lib/declarative/common/google-aip/methods/mod.ts";
import { generateOazapftsClientOf } from "./client.ts";

const typeInfo = createTypeInfoDecoratorFactory(
  new Project(),
  "./lib/declarative/common/openapi/oazapfts/client.test.ts",
);

@standardCreate()
@standardGet()
@jsonSchema()
@typeInfo()
class Person {
  public constructor(public name: string) {}
}

@openapi({
  specification: {
    openapi: "3.0.1",
    info: { title: "App", version: "0.0.1" },
    components: {},
  },
  resources: [Person],
})
class App {}

Deno.test("generateOazapftsClientOf generate client from openapi specification", async (t) => {
  const sourceCode = await generateOazapftsClientOf(App);
  await assertSnapshot(t, sourceCode);
});
