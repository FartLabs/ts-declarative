import { assert, assertEquals } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { jsonSchemaDecoratorFactoryOfFile } from "#/lib/declarative/common/json-schema/json-schema-file.ts";
import { OpenAPIServer } from "./openapi.ts";

const jsonSchema = await jsonSchemaDecoratorFactoryOfFile(import.meta.url);

@jsonSchema()
class Example {
  public constructor(public id: string, public name: string) {}
}

Deno.test("OpenAPIServer registers class", async (t) => {
  const server = new OpenAPIServer();
  server.register(Example);

  const actual = JSON.stringify(server.specification, null, 2);
  await assertSnapshot(t, actual);
});

Deno.test("OpenAPIServer manages resources", async (t) => {
  const server = new OpenAPIServer();
  server.register(Example);

  await t.step("Create resource", async () => {
    const resource = new Example("1", "Ash Ketchum");
    const response = await server.fetch(
      new Request("http://localhost:8000/example", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resource),
      }),
    );

    assert(response.status === 200);
  });

  await t.step("Read resource", async () => {
    const response = await server.fetch(
      new Request("http://localhost:8000/example/1"),
    );

    assert(response.status === 200);
    assertEquals(await server.storage.get("1"), {
      id: "1",
      name: "Ash Ketchum",
    });
    assertEquals(await response.json(), { id: "1", name: "Ash Ketchum" });
  });

  await t.step("Update resource", async () => {
    const resource = new Example("1", "Gary Oak");
    const response = await server.fetch(
      new Request("http://localhost:8000/example/1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resource),
      }),
    );

    assert(response.status === 200);
    assertEquals(await server.storage.get("1"), { id: "1", name: "Gary Oak" });
  });

  await t.step("List resources", async () => {
    const response = await server.fetch(
      new Request("http://localhost:8000/example"),
    );

    assert(response.status === 200);
    assertEquals(await response.json(), [{ id: "1", name: "Gary Oak" }]);
  });

  await t.step("Delete resource", async () => {
    const response = await server.fetch(
      new Request("http://localhost:8000/example/1", {
        method: "DELETE",
      }),
    );

    assert(response.status === 200);
    assertEquals(await server.storage.get("1"), undefined);
  });
});
