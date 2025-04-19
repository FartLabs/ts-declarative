import { assertEquals } from "@std/assert/equals";
import { MemoryStandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/memory/memory.ts";
import { standardGetHandler } from "./handler.ts";

Deno.test("standardGetHandler handles request", async () => {
  const store = new MemoryStandardMethodStore();
  await store.set(["fake"], { name: "fake" });

  const request = new Request("http://localhost/fake");
  const handler = standardGetHandler(store, [], "name");
  const response = await handler(
    request,
    new URLPattern({ pathname: "/:name" }).exec(request.url),
  );
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { name: "fake" });
});
