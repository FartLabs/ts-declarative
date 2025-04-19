import { assertEquals } from "@std/assert/equals";
import { MemoryStandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/memory/memory.ts";
import { standardUpdateHandler } from "./handler.ts";

Deno.test("standardUpdateHandler handles request", async () => {
  const store = new MemoryStandardMethodStore();
  const handler = standardUpdateHandler(store, [], "name");

  const request = new Request("http://localhost/fake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "fake" }),
  });

  const response = await handler(
    request,
    new URLPattern({ pathname: "/:name" }).exec(request.url),
  );
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { name: "fake" });
});
