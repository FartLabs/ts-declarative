import { assertEquals } from "@std/assert/equals";
import { MemoryStandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/memory/store.ts";
import { standardListHandler } from "./handler.ts";

Deno.test("standardListHandler handles request", async () => {
  const store = new MemoryStandardMethodStore();
  await store.set(["fake"], { name: "fake" });

  const request = new Request("http://localhost", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const handler = standardListHandler(store, []);
  const response = await handler(request);
  assertEquals(response.status, 200);
  assertEquals(await response.json(), [{ name: "fake" }]);
});
