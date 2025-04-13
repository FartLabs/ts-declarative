import { assertEquals } from "@std/assert/equals";
import { route } from "@std/http/unstable-route";
import { openapi, routesOf } from "#/lib/declarative/common/openapi/openapi.ts";
import {
  standardCreate,
  standardGet,
} from "#/lib/declarative/common/google-aip/methods/mod.ts";
import { createAutoSchemaDecoratorFactoryAt } from "#/lib/declarative/common/json-schema/auto-schema/auto-schema.ts";

const kv = await Deno.openKv(":memory:");
const autoSchema = await createAutoSchemaDecoratorFactoryAt(import.meta);

@standardCreate({ kv })
@standardGet({ kv })
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
  const handler = route(
    routesOf(App),
    () => new Response("Not Found", { status: 404 }),
  );

  const server = Deno.serve({ port: 8080 }, (request) => handler(request));
  const person = new Person("Ash Ketchum");

  await t.step("POST /people", async () => {
    const createPersonResponse = await fetch(
      "http://localhost:8080/people",
      { method: "POST", body: JSON.stringify(person) },
    );
    const createdPerson = await createPersonResponse.json();
    assertEquals(createdPerson.name, person.name);
    assertEquals(createPersonResponse.status, 200);
    assertEquals(
      (await kv.get<Person>(["/people", person.name]))?.value?.name,
      person.name,
    );
  });

  // await t.step("GET /people/{name}", async () => {
  //   const getPersonResponse = await fetch(
  //     `http://localhost:8080/people/${person.name}`,
  //   );
  //   const fetchedPerson = await getPersonResponse.json();
  //   assertEquals(fetchedPerson.name, person.name);
  //   assertEquals(getPersonResponse.status, 200);
  // });

  // TODO: Add cases for each standard method.

  await server.shutdown();
});
