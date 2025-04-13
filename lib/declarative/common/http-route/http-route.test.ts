import { assertEquals } from "@std/assert/equals";
import {
  httpRoutes,
  routesOf,
} from "#/lib/declarative/common/http-route/http-route.ts";
import { standardCreate } from "#/lib/declarative/common/google-aip/methods/standard-create/standard-create.ts";

@standardCreate()
class Person {
  public constructor(public name: string) {}
}

@httpRoutes({ resources: [Person] })
class App {}

Deno.test("httpRoutes", () => {
  assertEquals(routesOf(Person), []);
  assertEquals(routesOf(App), []);
});
