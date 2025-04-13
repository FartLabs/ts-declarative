import { assertEquals } from "@std/assert/equals";
import { routerOf } from "#/lib/declarative/common/router/router.ts";
import { openapi } from "#/lib/declarative/common/openapi/server.ts";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";
import { standardMethodsWithDenoKv } from "#/lib/declarative/common/google-aip/deno-kv.ts";

const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

const kv = await Deno.openKv(":memory:");
const standardMethod = standardMethodsWithDenoKv(kv);

@standardMethod.create()
@standardMethod.get()
@standardMethod.update()
@standardMethod.delete()
@standardMethod.list()
@autoSchema()
class Person {
  public constructor(public name: string) {}
}

@openapi({
  specification: { servers: [{ url: "http://localhost:8080" }] },
  resources: [Person],
})
class App {}

Deno.test("e2e routes respect OpenAPI specification", async (t) => {
  const server = Deno.serve({ port: 8080 }, routerOf(App));
  const ash = new Person("Ash Ketchum");
  const gary = new Person("Gary Oak");

  await t.step("POST /people", async () => {
    const createPersonResponse = await fetch("http://localhost:8080/people", {
      method: "POST",
      body: JSON.stringify(ash),
    });
    assertEquals(createPersonResponse.status, 200);

    const createdPerson = await createPersonResponse.json();
    assertEquals(createdPerson.name, ash.name);
    assertEquals(
      (await kv.get<Person>(["/people", ash.name]))?.value?.name,
      ash.name,
    );
  });

  await t.step("GET /people", async () => {
    const listPeopleResponse = await fetch("http://localhost:8080/people");
    assertEquals(listPeopleResponse.status, 200);

    const people = await listPeopleResponse.json();
    assertEquals(people.length, 1);
    assertEquals(people[0].name, ash.name);
  });

  await t.step("GET /people/{person}", async () => {
    const getPersonResponse = await fetch(
      `http://localhost:8080/people/${ash.name}`,
    );
    assertEquals(getPersonResponse.status, 200);

    const fetchedPerson = await getPersonResponse.json();
    assertEquals(fetchedPerson.name, ash.name);
  });

  await t.step("POST /people/{person}", async () => {
    const updatePersonResponse = await fetch(
      `http://localhost:8080/people/${ash.name}`,
      {
        method: "POST",
        body: JSON.stringify(gary),
      },
    );
    assertEquals(updatePersonResponse.status, 200);
    assertEquals((await updatePersonResponse.json()).name, gary.name);
    assertEquals((await kv.get<Person>(["/people", ash.name])).value, null);
    assertEquals(
      (await kv.get<Person>(["/people", gary.name])).value?.name,
      gary.name,
    );
  });

  await t.step("DELETE /people/{person}", async () => {
    const deletePersonResponse = await fetch(
      `http://localhost:8080/people/${gary.name}`,
      { method: "DELETE" },
    );
    assertEquals(deletePersonResponse.status, 200);
    assertEquals(
      await deletePersonResponse.text(),
      "Resource deleted successfully",
    );
    assertEquals((await kv.get<Person>(["/people", gary.name])).value, null);
  });

  await server.shutdown();
});
