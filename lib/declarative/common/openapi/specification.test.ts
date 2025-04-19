import { assertEquals } from "@std/assert/equals";
import { assertSnapshot } from "@std/testing/snapshot";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";
import {
  createStandardMethodsDecoratorFactory,
  standardCreate,
  standardGet,
} from "#/lib/declarative/common/google-aip/standard-methods.ts";
import { DenoKvStandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/deno-kv/deno-kv.ts";
import { openapiSpec, specificationOf } from "./specification.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

const kv = await Deno.openKv(":memory:");
const store = new DenoKvStandardMethodStore(kv);
const standardMethods = createStandardMethodsDecoratorFactory(kv);

@standardCreate({ store })
@standardGet({ kv })
@autoSchema()
class Person {
  public constructor(public name: string) {}
}

@openapiSpec({ resources: [Person] })
class PersonAPI {}

Deno.test("openapiSpec decorator decorates value", () => {
  const specification = specificationOf(PersonAPI);
  assertEquals(specification?.info.title, "PersonAPI");
  assertEquals(specification?.paths, {
    "/people": {
      post: {
        description: "Creates Person",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Person" },
            },
          },
          description: "The Person to create",
          required: true,
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Person" },
              },
            },
            description: "The created Person",
          },
        },
      },
    },
    "/people/{person}": {
      get: {
        description: "Gets Person",
        parameters: [
          {
            in: "path",
            name: "person",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Person" },
              },
            },
            description: "Got Person",
          },
        },
      },
    },
  });
});

@standardMethods({
  parent: "/api",
  standardMethods: {
    create: { store },
    delete: { store },
  },
})
@autoSchema()
class Cat {
  public constructor(public name: string) {}
}

@standardMethods({
  parent: "/api",
  standardMethods: {
    create: { store },
    delete: { store },
  },
})
@autoSchema()
class Dog {
  public constructor(public name: string) {}
}

@openapiSpec({ resources: [Cat, Dog] })
class ZooAPI {}

Deno.test("openapiSpec decorator with multiple resources", async (t) => {
  const specification = specificationOf(ZooAPI);
  await assertSnapshot(t, specification);
});
