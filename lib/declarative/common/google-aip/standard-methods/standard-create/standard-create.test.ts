import { assertEquals } from "@std/assert";
import { pathsObjectOf } from "#/lib/declarative/common/openapi/paths-object.ts";
import { routesOf } from "#/lib/declarative/common/router/router.ts";
import { DenoKvStandardMethodStorage } from "#/lib/declarative/common/google-aip/standard-methods/common/storage/deno-kv/deno-kv.ts";
import { standardCreate } from "./standard-create.ts";

const kv = await Deno.openKv(":memory:");

@standardCreate({ storage: new DenoKvStandardMethodStorage(kv) })
class Person {
  public constructor(public name: string) {}
}

Deno.test("standardCreate decorator factory decorates value", () => {
  assertEquals(routesOf(Person).length, 1);
  assertEquals(pathsObjectOf(Person), {
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
  });
});
