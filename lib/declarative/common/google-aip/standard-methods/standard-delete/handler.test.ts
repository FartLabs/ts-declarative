import { assertEquals } from "@std/assert/equals";
import { MemoryStandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/memory/store.ts";
import { standardDeleteHandler } from "./handler.ts";

Deno.test("standardDeleteHandler handles request", async () => {
  const store = new MemoryStandardMethodStore();
  await store.set(["fake"], { name: "fake" });

  const handler = standardDeleteHandler(store, [], "name");
  const request = new Request("http://localhost/fake", { method: "DELETE" });
  const response = await handler(
    request,
    new URLPattern({ pathname: "/:name" }).exec(request.url),
  );
  assertEquals(response.status, 200);
  assertEquals(await store.get(["fake"]), null);
});
