import { assertEquals } from "@std/assert/equals";
import { standardCreate } from "#/lib/declarative/common/google-aip/standard-methods/standard-create/standard-create.ts";
import { DenoKvStandardMethodStorage } from "#/lib/declarative/common/google-aip/standard-methods/common/storage/deno-kv/deno-kv.ts";
import { routerRoutes, routesOf } from "./router.ts";

const kv = await Deno.openKv(":memory:");

@standardCreate({ storage: new DenoKvStandardMethodStorage(kv) })
class Person {
  public constructor(public name: string) {}
}

@routerRoutes({ resources: [Person] })
class App {}

Deno.test("routerRoutes decorator adds routes to the router", () => {
  assertEquals(routesOf(Person).length, 1);
  assertEquals(routesOf(App).length, 1);
});
